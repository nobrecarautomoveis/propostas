'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { UserForm } from '@/components/users/user-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Id } from '../../../../../convex/_generated/dataModel';

interface EditUserPageProps {
  params: {
    id: string;
  };
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateUser = useMutation(api.users.updateUser);
  
  const userToEdit = useQuery(
    api.users.getUserById,
    currentUser ? { userId: params.id as Id<'users'> } : 'skip'
  );

  const handleSubmit = async (data: any) => {
    if (!currentUser) {
      toast.error('Usuário não autenticado');
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData: any = {
        userIdToUpdate: params.id as Id<'users'>,
        currentUserId: currentUser._id,
        name: data.name,
        role: data.role,
      };

      if (data.password) {
        updateData.password = data.password;
      }

      await updateUser(updateData);
      toast.success('Usuário atualizado com sucesso!');
      router.push('/usuarios');
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error(error.data || 'Erro ao atualizar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return <div>Acesso negado. Você precisa ser um administrador.</div>;
  }

  if (userToEdit === undefined) {
    return <div>Carregando...</div>;
  }

  if (!userToEdit) {
    return <div>Usuário não encontrado.</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={() => router.push('/usuarios')}>                        
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Editar Usuário</CardTitle>
          <CardDescription>Editar informações do usuário {userToEdit.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm 
            onSubmit={handleSubmit} 
            initialData={userToEdit}
            isSubmitting={isSubmitting} 
          />
        </CardContent>
      </Card>
    </div>
  );
}