'use client'

import { useAction, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useCurrentUser } from '@/hooks/use-current-user'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, ArrowLeft, PlusCircle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserForm } from './user-form'
import { Id } from '../../../convex/_generated/dataModel'

type User = {
  _id: Id<'users'>;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
};

export function UserList() {
  const router = useRouter()
  const { currentUser, isLoading } = useCurrentUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const users = useQuery(
    api.users.getUsers,
    currentUser ? { userId: currentUser._id } : 'skip',
  )
  const deleteUser = useAction(api.users.deleteUser)
  const createUser = useAction(api.users.createUser)
  const updateUser = useAction(api.users.updateUser)

  const handleFormSubmit = async (data: any) => {
    if (!currentUser) {
      toast.error('Usuário não autenticado');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingUser) {
        // Atualiza usuário existente
        const updateData: any = {
          userIdToUpdate: editingUser._id,
          currentUserId: currentUser._id,
          name: data.name,
          role: data.role,
        };

        if (data.password) {
          updateData.password = data.password;
        }

        await updateUser(updateData);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        // Cria novo usuário
        await createUser({
          name: data.name,
          email: data.email,
          password: data.password, // Corrigido de passwordHash para password
          role: data.role,
          currentUserId: currentUser._id // Adicionado currentUserId necessário
        });
        toast.success('Usuário criado com sucesso!');
      }
      
      setIsDialogOpen(false);
      setEditingUser(null);
    } catch (error: any) {
      console.error('Erro ao processar usuário:', error);
      toast.error(error.data || 'Erro ao processar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  }

  const handleNewClick = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  }

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete || !currentUser) return

    try {
      await deleteUser({ 
        userIdToDelete: userToDelete._id,
        currentUserId: currentUser._id 
      })
      toast.success('Usuário excluído com sucesso!')
      setUserToDelete(null);
    } catch (error: any) {
      console.error('Falha ao excluir usuário:', error)
      toast.error(error.data || 'Falha ao excluir usuário.')
    }
  }

  if (isLoading || users === undefined) {
    return <div>Carregando...</div>
  }

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return <div>Acesso negado. Você precisa ser um administrador para ver esta página.</div>
  }

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { setIsDialogOpen(isOpen); if (!isOpen) setEditingUser(null); }}>        
        <AlertDialog open={!!userToDelete} onOpenChange={(isOpen) => !isOpen && setUserToDelete(null)}>          
          <Card>
            <CardHeader>
              <div>
                <div className="mb-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={() => router.push('/propostas')}>                        
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Usuários</CardTitle>
                    <CardDescription>Gerencie os usuários do sistema.</CardDescription>
                  </div>
                  <div>
                    <Button onClick={handleNewClick}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Novo Usuário
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead className="w-[64px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditClick(user)}
                              >
                                Editar
                              </DropdownMenuItem>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  className="text-red-500"
                                  onSelect={(e) => e.preventDefault()}
                                  onClick={() => handleDeleteClick(user)}
                                >
                                  Excluir
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
              <AlertDialogDescription>
                Essa ação não pode ser desfeita. Isso excluirá permanentemente o
                usuário <span className="font-bold">{userToDelete?.name}</span> e removerá seus dados de nossos servidores.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>
                Continuar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Atualize os dados do usuário abaixo.' : 'Preencha os campos abaixo para criar um novo usuário.'}
            </DialogDescription>
          </DialogHeader>
          <UserForm 
            onSubmit={handleFormSubmit} 
            initialData={editingUser || undefined}
            isSubmitting={isSubmitting} 
          />
        </DialogContent>
      </Dialog>
    </>
  )
}