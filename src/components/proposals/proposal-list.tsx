'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProposalForm, ProposalFormData } from './proposal-form';
import { format } from 'date-fns';

type Proposal = ProposalFormData & {
  id: string;
  dateAdded: Date;
};

const initialProposals: Proposal[] = [
  { id: 'PROP-001', proposalType: 'financing', vehicleType: 'car', vehicleCondition: 'used', isFinanced: false, brand: 'Volkswagen', model: 'Nivus', modelYear: 2023, manufactureYear: 2023, value: 130000, status: 'Em Análise', state: 'SP', fuel: 'flex', transmission: 'automatic', color: 'Branco', licensingLocation: 'SP', dateAdded: new Date(2023, 10, 5), version: 'Highline', bodywork: 'SUV', plate: 'ABC-1234' },
  { id: 'PROP-002', proposalType: 'financing', vehicleType: 'car', vehicleCondition: 'new', isFinanced: false, brand: 'Honda', model: 'Civic', modelYear: 2024, manufactureYear: 2024, value: 160000, status: 'Aprovada', state: 'RJ', fuel: 'flex', transmission: 'automatic', color: 'Preto', licensingLocation: 'RJ', dateAdded: new Date(2023, 10, 8), version: 'Touring', bodywork: 'Sedan' },
  { id: 'PROP-003', proposalType: 'refinancing', vehicleType: 'car', vehicleCondition: 'used', isFinanced: true, brand: 'Fiat', model: 'Toro', modelYear: 2022, manufactureYear: 2022, value: 145000, status: 'Recusada', state: 'MG', fuel: 'diesel', transmission: 'automatic', color: 'Vinho', licensingLocation: 'MG', dateAdded: new Date(2023, 10, 12), version: 'Volcano', bodywork: 'Picape', plate: 'DEF-5678' },
  { id: 'PROP-004', proposalType: 'financing', vehicleType: 'car', vehicleCondition: 'used', isFinanced: false, brand: 'Hyundai', model: 'Creta', modelYear: 2023, manufactureYear: 2023, value: 135000, status: 'Aprovada', state: 'SP', fuel: 'flex', transmission: 'automatic', color: 'Prata', licensingLocation: 'SP', dateAdded: new Date(2023, 10, 15), version: 'Ultimate', bodywork: 'SUV', plate: 'GHI-9012' },
  { id: 'PROP-005', proposalType: 'financing', vehicleType: 'motorcycle', vehicleCondition: 'new', isFinanced: false, brand: 'Chevrolet', model: 'Onix', modelYear: 2024, manufactureYear: 2024, value: 95000, status: 'Em Análise', state: 'BA', fuel: 'flex', transmission: 'manual', color: 'Azul', licensingLocation: 'BA', dateAdded: new Date(2023, 10, 20), version: 'LTZ' },
];


const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  'Aprovada': 'default',
  'Em Análise': 'secondary',
  'Recusada': 'destructive',
};

export function ProposalList() {
    const [search, setSearch] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
    const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);

    const handleFormSubmit = (data: ProposalFormData) => {
        if (editingProposal) {
            // Update existing proposal
            const updatedProposals = proposals.map(p => 
                p.id === editingProposal.id ? { ...editingProposal, ...data } : p
            );
            setProposals(updatedProposals);
        } else {
            // Add new proposal
            const newProposal: Proposal = {
                ...data,
                id: `PROP-${String(proposals.length + 1).padStart(3, '0')}`,
                dateAdded: new Date(),
            };
            setProposals(prev => [newProposal, ...prev]);
        }
        setIsDialogOpen(false);
        setEditingProposal(null);
    };

    const handleEditClick = (proposal: Proposal) => {
        setEditingProposal(proposal);
        setIsDialogOpen(true);
    }
    
    const handleNewClick = () => {
        setEditingProposal(null);
        setIsDialogOpen(true);
    }

    const filteredProposals = proposals.filter(p => 
        p.brand.toLowerCase().includes(search.toLowerCase()) ||
        p.model.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { setIsDialogOpen(isOpen); if (!isOpen) setEditingProposal(null); }}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
              <div>
                  <CardTitle>Propostas</CardTitle>
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
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
                <Input
                  placeholder="Buscar por marca ou modelo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-sm"
                />
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
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
                          <TableRow key={proposal.id}>
                              <TableCell className="font-medium">{format(proposal.dateAdded, 'dd/MM/yyyy')}</TableCell>
                              <TableCell>
                                  <div className="font-medium">{proposal.brand}</div>
                                  <div className="text-sm text-muted-foreground">{proposal.model}</div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">{proposal.modelYear}</TableCell>
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
                                          <DropdownMenuItem className="text-destructive focus:bg-destructive/90 focus:text-destructive-foreground">Excluir</DropdownMenuItem>
                                      </DropdownMenuContent>
                                  </DropdownMenu>
                              </TableCell>
                          </TableRow>
                      ))
                  ) : (
                      <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                              Nenhuma proposta encontrada.
                          </TableCell>
                      </TableRow>
                  )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
              <DialogTitle>{editingProposal ? 'Editar Proposta' : 'Nova Proposta de Veículo'}</DialogTitle>
              <DialogDescription>{editingProposal ? 'Atualize os dados da proposta abaixo.' : 'Preencha os campos abaixo para criar uma nova proposta.'}</DialogDescription>
          </DialogHeader>
          <ProposalForm onSubmit={handleFormSubmit} initialData={editingProposal || undefined} />
      </DialogContent>
    </Dialog>
  );
}
