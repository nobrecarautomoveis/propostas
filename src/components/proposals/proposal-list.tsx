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
    const [selectedUser, setSelectedUser] = useState<string>('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
    const [proposalToDelete, setProposalToDelete] = useState<Proposal | null>(null);

    // Consulta as propostas do backend (só quando autenticado)
    const proposals = useQuery(
      api.proposals.getProposals,
      currentUser?._id ? { userId: currentUser._id } : "skip"
    );

    // Consulta todos os usuários para o filtro (TEMPORARIAMENTE DESABILITADO)
    // const users = useQuery(
    //   api.users.getAllUsers,
    //   currentUser?._id ? { requesterId: currentUser._id } : "skip"
    // );

    // MOCK temporário para não quebrar o sistema
    const users = currentUser ? [
      { _id: currentUser._id, name: currentUser.name, email: currentUser.email, role: currentUser.role }
    ] : [];

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

    // Função para converter Proposal para ProposalFormData
    const convertProposalToFormData = (proposal: Proposal): ProposalFormData => {
        const { _id, proposalNumber, dateAdded, salespersonId, ...formData } = proposal as any;
        return {
            ...formData,
            // Garantir que campos opcionais tenham valores padrão adequados
            plate: formData.plate || '',
            bodywork: formData.bodywork || '',
            version: formData.version || '',
            state: formData.state || '',
            valorFinanciar: formData.valorFinanciar || '',

            // Dados pessoais - garantir valores padrão
            cpfCnpj: formData.cpfCnpj || '',
            email: formData.email || '',
            telefonePessoal: formData.telefonePessoal || '',
            telefoneReferencia: formData.telefoneReferencia || '',
            endereco: formData.endereco || '',

            // Pessoa física
            nome: formData.nome || '',
            dataNascimento: formData.dataNascimento || '',
            sexo: formData.sexo || '',
            nomeMae: formData.nomeMae || '',
            nomePai: formData.nomePai || '',
            rg: formData.rg || '',
            dataEmissaoRg: formData.dataEmissaoRg || '',
            orgaoExpedidor: formData.orgaoExpedidor || '',
            naturalidade: formData.naturalidade || '',
            estadoCivil: formData.estadoCivil || '',
            possuiCnh: formData.possuiCnh || false,

            // Pessoa jurídica
            razaoSocial: formData.razaoSocial || '',
            nomeFantasia: formData.nomeFantasia || '',

            // Tipo de pessoa
            tipoPessoa: formData.tipoPessoa || 'fisica',
        } as ProposalFormData;
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

    // Filtra as propostas com base na pesquisa, mês e usuário selecionados
    const filteredProposals = proposals?.filter(p => {
        const searchTerm = search.toLowerCase();
        const brandMatch = (p.brandName && p.brandName.toLowerCase().includes(searchTerm)) ||
                         (p.brand && p.brand.toLowerCase().includes(searchTerm));
        const modelMatch = (p.modelName && p.modelName.toLowerCase().includes(searchTerm)) ||
                         (p.model && p.model.toLowerCase().includes(searchTerm));
        const proposalNumberMatch = p.proposalNumber.toLowerCase().includes(searchTerm);

        const searchMatch = brandMatch || modelMatch || proposalNumberMatch;

        // Filtro por mês
        let monthMatch = true;
        if (selectedMonth !== 'all') {
            const proposalDate = new Date(p.dateAdded);
            const proposalMonth = format(proposalDate, 'MM');
            monthMatch = proposalMonth === selectedMonth;
        }

        // Filtro por usuário
        let userMatch = true;
        if (selectedUser !== 'all') {
            userMatch = p.createdBy?._id === selectedUser;
        }

        return searchMatch && monthMatch && userMatch;
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
                      <Select value={selectedUser} onValueChange={setSelectedUser}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue placeholder="Todos os usuários" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os usuários</SelectItem>
                          {users?.map((user) => (
                            <SelectItem key={user._id} value={user._id}>
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-medium text-primary">
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                {user.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </div>
                </div>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[120px] font-semibold py-4 text-center">Nº Proposta</TableHead>
                        <TableHead className="w-[100px] font-semibold py-4 text-center">Data</TableHead>
                        <TableHead className="w-[180px] hidden lg:table-cell font-semibold py-4 text-center">Criado por</TableHead>
                        <TableHead className="w-[140px] font-semibold py-4 text-center">Tipo</TableHead>
                        <TableHead className="min-w-[200px] font-semibold py-4 text-center">Marca/Modelo</TableHead>
                        <TableHead className="w-[80px] hidden md:table-cell font-semibold py-4 text-center">Ano</TableHead>
                        <TableHead className="w-[130px] hidden md:table-cell font-semibold py-4 text-center">Valor</TableHead>
                        <TableHead className="w-[120px] font-semibold py-4 text-center">Status</TableHead>
                        <TableHead className="w-[60px] py-4 text-center"><span className="sr-only">Ações</span></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProposals.length > 0 ? (
                            filteredProposals.map((proposal) => (
                                <TableRow key={proposal._id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium text-sm py-3 text-center">{proposal.proposalNumber}</TableCell>
                                    <TableCell className="text-sm py-3 text-center">{format(new Date(proposal.dateAdded), 'dd/MM')}</TableCell>
                                    <TableCell className="hidden lg:table-cell py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-medium text-primary">
                                                    {proposal.createdBy?.name ? proposal.createdBy.name.charAt(0).toUpperCase() : '?'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-medium truncate">{proposal.createdBy?.name || 'Não encontrado'}</span>
                                                <span className="text-xs text-muted-foreground truncate">{proposal.createdBy?.email || ''}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm py-3 text-center">
                                        <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                                            {proposal.proposalType === 'financing' ? 'Financ.' : 'Refinanc.'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <div className="space-y-1">
                                            <div className="font-medium text-sm truncate">{proposal.brandName || proposal.brand}</div>
                                            <div className="text-xs text-muted-foreground truncate">{proposal.modelName || proposal.model}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-sm py-3 text-center">
                                        {typeof proposal.modelYear === 'string' && proposal.modelYear.includes('-') ? proposal.modelYear.split('-')[0] : proposal.modelYear}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-sm py-3 font-medium text-center">
                                        {proposal.valorFinanciar || 'N/A'}
                                    </TableCell>
                                    <TableCell className="py-3 text-center">
                                        <Badge variant={statusVariant[proposal.status] || 'outline'} className="text-xs">
                                            {proposal.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
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
                                <TableCell colSpan={9} className="h-24 text-center">
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
                <DialogTitle>{editingProposal ? 'Editar Proposta' : 'Nova Proposta'}</DialogTitle>
                <DialogDescription>{editingProposal ? 'Atualize os dados da proposta abaixo.' : 'Preencha os campos abaixo para criar uma nova proposta.'}</DialogDescription>
            </DialogHeader>
            <ProposalForm
                onSubmit={handleFormSubmit}
                initialData={editingProposal ? convertProposalToFormData(editingProposal) : undefined}
            />
        </DialogContent>
      </Dialog>
    </>
  );
}
