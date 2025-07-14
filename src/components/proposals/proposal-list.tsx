'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProposalForm, ProposalFormData } from './proposal-form';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Id } from '../../../convex/_generated/dataModel';

type Proposal = ProposalFormData & {
  _id: Id<"proposals">;
  proposalNumber: string;
  dateAdded: string;
};

// Mapeamento de status para variantes de badge
const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "Em Análise": "secondary",
  "Aprovada": "default",
  "Recusada": "destructive"
};

export function ProposalList() {
    const { toast } = useToast();
    const { currentUser } = useCurrentUser();
    const [search, setSearch] = useState('');
    const [selectedMonth, setSelectedMonth] = useState<string>('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
    const [proposalToDelete, setProposalToDelete] = useState<Proposal | null>(null);

    // Consulta as propostas do backend
    const proposals = useQuery(
      api.proposals.getProposals, 
      { userId: currentUser?._id || null },
      { enabled: !!currentUser?._id } // Só executa se houver usuário autenticado
    );

    // Mutations para criar, atualizar e excluir propostas
    const createProposalMutation = useMutation(api.proposals.createProposal);
    const updateProposalMutation = useMutation(api.proposals.updateProposal);
    const deleteProposalMutation = useMutation(api.proposals.deleteProposal);

    const handleFormSubmit = async (data: ProposalFormData) => {
        try {
            if (editingProposal) {
                // Atualiza proposta existente
                await updateProposalMutation({
                    proposalId: editingProposal._id,
                    userId: currentUser?._id as Id<"users">,
                    ...data
                });
                
                toast({
                    title: "Proposta Atualizada",
                    description: "A proposta foi atualizada com sucesso."
                });
            } else {
                // Cria nova proposta
                await createProposalMutation({
                    ...data,
                    userId: currentUser?._id as Id<"users">
                });
                
                toast({
                    title: "Proposta Criada",
                    description: "A proposta foi criada com sucesso."
                });
            }
            
            setIsDialogOpen(false);
            setEditingProposal(null);
        } catch (error) {
            toast({
                title: "Erro",
                description: error instanceof Error ? error.message : "Ocorreu um erro ao processar a proposta.",
                variant: "destructive"
            });
        }
    };

    const handleEditClick = (proposal: Proposal) => {
        setEditingProposal(proposal);
        setIsDialogOpen(true);
    }
    
    const handleNewClick = () => {
        setEditingProposal(null);
        setIsDialogOpen(true);
    }
    
    const handleDeleteClick = (proposal: Proposal) => {
        setProposalToDelete(proposal);
    };

    const handleDeleteConfirm = async () => {
        if (proposalToDelete && currentUser) {
            try {
                await deleteProposalMutation({
                    proposalId: proposalToDelete._id,
                    userId: currentUser._id
                });
                
                toast({
                    title: "Proposta Excluída",
                    description: `A proposta ${proposalToDelete.proposalNumber} foi removida com sucesso.`,
                    variant: 'destructive'
                });
                
                setProposalToDelete(null);
            } catch (error) {
                toast({
                    title: "Erro",
                    description: error instanceof Error ? error.message : "Ocorreu um erro ao excluir a proposta.",
                    variant: "destructive"
                });
            }
        }
    };

    // Gera lista de meses para o seletor
    const getMonthOptions = () => {
        const months = [
            { value: 'all', label: 'Todos os meses' },
            { value: '01', label: 'Janeiro' },
            { value: '02', label: 'Fevereiro' },
            { value: '03', label: 'Março' },
            { value: '04', label: 'Abril' },
            { value: '05', label: 'Maio' },
            { value: '06', label: 'Junho' },
            { value: '07', label: 'Julho' },
            { value: '08', label: 'Agosto' },
            { value: '09', label: 'Setembro' },
            { value: '10', label: 'Outubro' },
            { value: '11', label: 'Novembro' },
            { value: '12', label: 'Dezembro' }
        ];
        return months;
    };

    // Filtra as propostas com base na pesquisa e mês selecionado
    const filteredProposals = proposals?.filter(p => {
        const searchTerm = search.toLowerCase();
        const brandMatch = (p.brandName && p.brandName.toLowerCase().includes(searchTerm)) || 
                         (p.brand && p.brand.toLowerCase().includes(searchTerm));
        const modelMatch = (p.modelName && p.modelName.toLowerCase().includes(searchTerm)) || 
                         (p.model && p.model.toLowerCase().includes(searchTerm));
        const proposalNumberMatch = p.proposalNumber.toLowerCase().includes(searchTerm);
        
        const searchMatch = brandMatch || modelMatch || proposalNumberMatch;
        
        // Filtro por mês
        if (selectedMonth === 'all') {
            return searchMatch;
        }
        
        const proposalDate = new Date(p.dateAdded);
        const proposalMonth = format(proposalDate, 'MM');
        const monthMatch = proposalMonth === selectedMonth;
        
        return searchMatch && monthMatch;
    }) || [];

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { setIsDialogOpen(isOpen); if (!isOpen) setEditingProposal(null); }}>
        <AlertDialog open={!!proposalToDelete} onOpenChange={(isOpen) => !isOpen && setProposalToDelete(null)}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <CardTitle className="mb-1">Propostas</CardTitle>
                        <CardDescription>
                          Gerencie suas propostas de financiamento e refinanciamento.
                        </CardDescription>
                    </div>
                    <Button onClick={handleNewClick}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Nova Proposta
                    </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                      <Input
                        placeholder="Buscar por marca, modelo ou nº da proposta..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-[300px]"
                      />
                      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Selecionar mês" />
                        </SelectTrigger>
                        <SelectContent>
                          {getMonthOptions().map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </div>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[150px]">Nº da Proposta</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo de Proposta</TableHead>
                        <TableHead>Marca/Modelo</TableHead>
                        <TableHead className="hidden md:table-cell">Ano</TableHead>
                        <TableHead className="hidden md:table-cell">Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead><span className="sr-only">Ações</span></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProposals.length > 0 ? (
                            filteredProposals.map((proposal) => (
                                <TableRow key={proposal._id}>
                                    <TableCell className="font-medium">{proposal.proposalNumber}</TableCell>
                                    <TableCell className="font-medium">{format(new Date(proposal.dateAdded), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>{proposal.proposalType === 'financing' ? 'Financiamento' : 'Refinanciamento'}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{proposal.brandName || proposal.brand} / {proposal.modelName || proposal.model}</div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{typeof proposal.modelYear === 'string' && proposal.modelYear.includes('-') ? proposal.modelYear.split('-')[0] : proposal.modelYear}</TableCell>
                                    <TableCell className="hidden md:table-cell">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.value)}</TableCell>
                                    <TableCell><Badge variant={statusVariant[proposal.status] || 'outline'}>{proposal.status}</Badge></TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditClick(proposal)}>Editar</DropdownMenuItem>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem 
                                                        className="text-destructive focus:bg-destructive/90 focus:text-destructive-foreground"
                                                        onSelect={(e) => e.preventDefault()}
                                                        onClick={() => handleDeleteClick(proposal)}
                                                    >
                                                        Excluir
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    Nenhuma proposta encontrada.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                    Essa ação não pode ser desfeita. Isso excluirá permanentemente a proposta
                    <span className="font-bold"> {proposalToDelete?.id}</span>.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm}>Continuar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>{editingProposal ? 'Editar Proposta' : 'Nova Proposta de Veículo'}</DialogTitle>
                <DialogDescription>{editingProposal ? 'Atualize os dados da proposta abaixo.' : 'Preencha os campos abaixo para criar uma nova proposta.'}</DialogDescription>
            </DialogHeader>
            <ProposalForm onSubmit={handleFormSubmit} initialData={editingProposal || undefined} />
        </DialogContent>
      </Dialog>
    </>
  );
}
