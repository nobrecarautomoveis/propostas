import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Rotas públicas que não precisam de autenticação
    const publicRoutes = ['/', '/test', '/login-simple'];

    // Permite acesso às rotas públicas
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    // Verifica autenticação para rotas protegidas
    const userId = request.cookies.get('userId')?.value;

    if (!userId) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // Em caso de erro, permite acesso (fail-safe)
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};