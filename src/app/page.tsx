import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="grid w-full max-w-6xl grid-cols-1 md:grid-cols-2 rounded-xl overflow-hidden shadow-2xl">
        <div className="relative hidden h-full min-h-[500px] flex-col justify-between bg-primary p-10 text-white md:flex">
          <div className="absolute inset-0 bg-primary-foreground/10" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6.343a4.5 4.5 0 0 1 0 6.314" />
              <path d="M18.071 3.272a9 9 0 0 1 0 12.728" />
              <path d="M5.003 6.57A4.5 4.5 0 0 1 7.83 5.003" />
              <path d="M2.93 3.515A9 9 0 0 1 9.485 2.93" />
              <path d="M12 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path d="M12 12v6.5" />
              <path d="M12 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
              <path d="m20 2-2 2" />
              <path d="m3 21 2-2" />
            </svg>
            Fale Mais Fácil
          </div>
          <div className="relative z-20 mt-auto">
            <p className="text-lg">
              “Esta ferramenta transformou a forma como gerenciamos nossas reuniões e propostas. É simplesmente indispensável.”
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
