import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="grid w-full max-w-6xl grid-cols-1 md:grid-cols-2 rounded-xl overflow-hidden shadow-2xl">
        <div className="relative hidden h-full min-h-[500px] flex-col justify-between bg-primary p-10 text-white md:flex">
          <div className="absolute inset-0 bg-primary-foreground/10" />
          <div className="relative z-20 mt-auto">
            <p className="text-lg">
              “Esta ferramenta transformou a forma como gerenciamos nossas propostas. É simplesmente indispensável.”
            </p>
            <footer className="text-sm mt-4">Sofia Davis, Gerente de Vendas</footer>
          </div>
        </div>
        <div className="flex items-center justify-center p-6 bg-card">
          <Card className="w-full max-w-md border-0 shadow-none">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold tracking-tight">Acesse sua conta</CardTitle>
              <CardDescription>
                Digite seu e-mail e senha para entrar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
