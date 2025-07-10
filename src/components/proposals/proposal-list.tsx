'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import Link from 'next/link';

const mockProposals = [
  { id: 'PROP-001', brand: 'Volkswagen', model: 'Nivus', year: 2023, value: 130000, type: 'Financiamento', status: 'Em Análise', state: 'SP' },
  { id: 'PROP-002', brand: 'Honda', model: 'Civic', year: 2024, value: 160000, type: 'Financiamento', status: 'Aprovada', state: 'RJ' },
  { id: 'PROP-003', brand: 'Fiat', model: 'Toro', year: 2022, value: 145000, type: 'Refinanciamento', status: 'Recusada', state: 'MG' },
  { id: 'PROP-004', brand: 'Hyundai', model: 'Creta', year: 2023, value: 135000, type: 'Financiamento', status: 'Aprovada', state: 'SP' },
  { id: 'PROP-005', brand: 'Chevrolet', model: 'Onix', year: 2024, value: 95000, type: 'Financiamento', status: 'Em Análise', state: 'BA' },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  'Aprovada': 'default',
  'Em Análise': 'secondary',
  'Recusada': 'destructive',
};

export function ProposalList() {
    const [search, setSearch] = useState('');

    const filteredProposals = mockProposals.filter(p => 
        p.brand.toLowerCase().includes(search.toLowerCase()) ||
        p.model.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
            <div>
                <CardTitle>Propostas</CardTitle>
                <CardDescription>
                  Gerencie suas propostas de financiamento e refinanciamento.
                </CardDescription>
            </div>
            <Link href="/propostas/nova" passHref>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Proposta
              </Button>
            </Link>
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
                <TableHead>Marca/Modelo</TableHead>
                <TableHead className="hidden md:table-cell">Ano</TableHead>
                <TableHead className="hidden md:table-cell">Valor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Ações</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {filteredProposals.length > 0 ? (
                    filteredProposals.map((proposal) => (
                        <TableRow key={proposal.id}>
                            <TableCell>
                                <div className="font-medium">{proposal.brand}</div>
                                <div className="text-sm text-muted-foreground">{proposal.model}</div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{proposal.year}</TableCell>
                            <TableCell className="hidden md:table-cell">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.value)}</TableCell>
                            <TableCell>{proposal.type}</TableCell>
                            <TableCell><Badge variant={statusVariant[proposal.status] || 'outline'}>{proposal.status}</Badge></TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Editar</DropdownMenuItem>
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
  );
}
