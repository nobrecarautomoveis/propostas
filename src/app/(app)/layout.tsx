'use client';

import { Header } from '@/components/layout/header';
import { AuthGuard } from '@/components/auth/auth-guard';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1 bg-background p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full" style={{ maxWidth: '1440px' }}>
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
