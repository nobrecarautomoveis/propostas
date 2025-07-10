import { AudioRecorder } from '@/components/dashboard/audio-recorder';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-4">
      <AudioRecorder />
      
      <Separator className="my-8" />
      
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Histórico de Conversas</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <Link href="#">
              <CardHeader>
                <CardTitle>Reunião de Vendas - Q2</CardTitle>
                <CardDescription>Gravado em 22 de Julho, 2024</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  Discussão sobre as metas de vendas para o segundo trimestre, análise de performance e planejamento de novas estratégias de marketing...
                </p>
              </CardContent>
            </Link>
          </Card>
           <Card className="hover:shadow-lg transition-shadow">
             <Link href="#">
              <CardHeader>
                <CardTitle>Entrevista com Candidato</CardTitle>
                <CardDescription>Gravado em 21 de Julho, 2024</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  Entrevista com João Silva para a vaga de Desenvolvedor Sênior. Foco em experiência com React, Node.js e arquitetura de microserviços...
                </p>
              </CardContent>
             </Link>
          </Card>
           <Card className="hover:shadow-lg transition-shadow">
             <Link href="#">
              <CardHeader>
                <CardTitle>Brainstorm de Produto</CardTitle>
                <CardDescription>Gravado em 20 de Julho, 2024</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  Sessão de brainstorming para o novo app "Fale Mais Fácil". Definição de features, MVP e roadmap inicial. Principais tópicos: transcrição e resumo com IA...
                </p>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
