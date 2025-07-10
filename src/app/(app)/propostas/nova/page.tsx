import { ProposalForm } from '@/components/proposals/proposal-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewProposalPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Nova Proposta de Veículo</CardTitle>
                    <CardDescription>Preencha os campos abaixo para criar uma nova proposta.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProposalForm />
                </CardContent>
            </Card>
        </div>
    );
}
