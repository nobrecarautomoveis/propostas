import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.log('🔍 Middleware executando para:', request.nextUrl.pathname);
  
  // Rotas que NÃO precisam de autenticação
  const publicPaths = ['/'];
  
  // Verifica se a rota atual é pública
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname);
  
  // Se for rota pública, permite acesso
  if (isPublicPath) {
    console.log('✅ Rota pública permitida:', request.nextUrl.pathname);
    return NextResponse.next();
  }
  
  // Para rotas protegidas, verifica se há token de autenticação
  const userId = request.cookies.get('userId')?.value;
  
  console.log('🔐 Verificando autenticação para:', request.nextUrl.pathname);
  console.log('👤 UserId no cookie:', userId ? 'Presente' : 'Ausente');
  
  // Se não há autenticação, redireciona para login
  if (!userId) {
    console.log('❌ Redirecionando para login - sem autenticação');
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  console.log('✅ Acesso autorizado para:', request.nextUrl.pathname);
  return NextResponse.next();
}

// Configura quais rotas o middleware deve interceptar
export const config = {
  matcher: [
    /*
     * Intercepta todas as rotas exceto:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - arquivos estáticos
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};