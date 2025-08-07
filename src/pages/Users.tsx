import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/enhanced-button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Users as UsersIcon, Search, Shield, UserCog, Crown, User, Edit, Save, X, UserPlus, UserX, UserCheck } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'

interface UserProfile {
  id: string
  user_id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  email: string | null
  is_active: boolean
  created_at: string
}

interface UserWithRole extends UserProfile {
  role: string
}

const Users = () => {
  const [users, setUsers] = useState<UserWithRole[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false)
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [newRole, setNewRole] = useState('')
  const [editingProfile, setEditingProfile] = useState({
    full_name: '',
    phone: '',
    email: ''
  })
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    phone: '',
    role: 'user' as 'admin' | 'moderator' | 'user'
  })
  const { toast } = useToast()
  const { hasRole, user: currentUser } = useAuth()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      // Fetch all profiles with their roles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          full_name,
          avatar_url,
          phone,
          email,
          is_active,
          created_at
        `)
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Fetch user roles separately
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')

      if (rolesError) throw rolesError

      // Combine profiles with roles
      const usersWithRoles: UserWithRole[] = profilesData?.map(profile => {
        const userRole = rolesData?.find(r => r.user_id === profile.user_id)
        
        return {
          ...profile,
          role: userRole?.role || 'user'
        }
      }) || []

      setUsers(usersWithRoles)
      
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return

    try {
      // First, delete existing role
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.user_id)

      if (deleteError) throw deleteError

      // Then insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: selectedUser.user_id,
          role: newRole as 'admin' | 'moderator' | 'user',
          assigned_by: currentUser?.id
        })

      if (error) throw error

      toast({
        title: "Rol actualizado",
        description: `El rol de ${selectedUser.full_name || selectedUser.email} ha sido actualizado a ${newRole}`,
      })

      setIsRoleDialogOpen(false)
      fetchUsers()
      
    } catch (error) {
      console.error('Error updating role:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol",
        variant: "destructive",
      })
    }
  }

  const handleEditProfile = async () => {
    if (!selectedUser) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editingProfile.full_name,
          phone: editingProfile.phone,
          email: editingProfile.email
        })
        .eq('user_id', selectedUser.user_id)

      if (error) throw error

      toast({
        title: "Perfil actualizado",
        description: `El perfil de ${selectedUser.full_name || selectedUser.email} ha sido actualizado`,
      })

      setIsEditProfileDialogOpen(false)
      fetchUsers()
      
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      })
    }
  }

  const handleCreateUser = async () => {
    try {
      // Generate a generic password
      const genericPassword = 'Usuario123!'
      
      // Create user in auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: newUser.email,
        password: genericPassword,
        options: {
          data: {
            full_name: newUser.full_name
          }
        }
      })

      if (signUpError) throw signUpError

      if (data.user) {
        // Create profile manually since trigger might not work in admin context
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            full_name: newUser.full_name,
            phone: newUser.phone,
            email: newUser.email,
            is_active: true
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }

        // Assign role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: newUser.role,
            assigned_by: currentUser?.id
          })

        if (roleError) throw roleError

        toast({
          title: "Usuario creado",
          description: `Usuario ${newUser.full_name} creado exitosamente. Contraseña: ${genericPassword}`,
        })

        setIsNewUserDialogOpen(false)
        setNewUser({
          email: '',
          full_name: '',
          phone: '',
          role: 'user'
        })
        fetchUsers()
      }
      
    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        title: "Error",
        description: "No se pudo crear el usuario",
        variant: "destructive",
      })
    }
  }

  const handleToggleUserStatus = async () => {
    if (!selectedUser) return

    try {
      const newStatus = !selectedUser.is_active
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: newStatus })
        .eq('user_id', selectedUser.user_id)

      if (error) throw error

      toast({
        title: "Estado actualizado",
        description: `Usuario ${newStatus ? 'habilitado' : 'inhabilitado'} exitosamente`,
      })

      setIsStatusDialogOpen(false)
      fetchUsers()
      
    } catch (error) {
      console.error('Error updating user status:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del usuario",
        variant: "destructive",
      })
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4" />
      case 'moderator':
        return <Shield className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'moderator':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador'
      case 'moderator':
        return 'Vendedor'
      default:
        return 'Usuario'
    }
  }

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Check if user has admin permissions
  if (!hasRole('admin')) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="min-h-screen bg-gradient-dashboard p-6 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            <Card className="shadow-elegant">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Acceso Restringido</h2>
                <p className="text-muted-foreground text-center">
                  No tienes permisos para acceder a la gestión de usuarios.
                  <br />
                  Contacta a un administrador si necesitas acceso.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="min-h-screen bg-gradient-dashboard p-6 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Cargando usuarios...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="min-h-screen bg-gradient-dashboard p-6 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
              <p className="text-muted-foreground">
                Administra usuarios y sus roles en el sistema
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="gradient"
                onClick={() => setIsNewUserDialogOpen(true)}
                className="flex items-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Nuevo Usuario</span>
              </Button>
              <Badge variant="outline" className="flex items-center space-x-1">
                <UsersIcon className="h-4 w-4" />
                <span>{users.length} usuarios</span>
              </Badge>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Administradores
                </CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {users.filter(user => user.role === 'admin').length}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Vendedores
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {users.filter(user => user.role === 'moderator').length}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Usuarios Activos
                </CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {users.filter(user => user.is_active).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  de {users.length} totales
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Lista de Usuarios</span>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-80"
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha de Registro</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center space-y-2">
                            <UsersIcon className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No se encontraron usuarios</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-accent/50">
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <span className="font-medium">
                                {user.full_name || 'Sin nombre'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{user.email || 'Sin email'}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={getRoleBadgeVariant(user.role)}
                              className="flex items-center space-x-1 w-fit"
                            >
                              {getRoleIcon(user.role)}
                              <span>{getRoleDisplayName(user.role)}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.is_active ? "default" : "destructive"}
                              className="flex items-center space-x-1 w-fit"
                            >
                              {user.is_active ? (
                                <UserCheck className="h-3 w-3" />
                              ) : (
                                <UserX className="h-3 w-3" />
                              )}
                              <span>{user.is_active ? 'Activo' : 'Inactivo'}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString('es-MX')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user)
                                  setEditingProfile({
                                    full_name: user.full_name || '',
                                    phone: user.phone || '',
                                    email: user.email || ''
                                  })
                                  setIsEditProfileDialogOpen(true)
                                }}
                                disabled={user.user_id === currentUser?.id}
                                title="Editar perfil"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user)
                                  setNewRole(user.role)
                                  setIsRoleDialogOpen(true)
                                }}
                                disabled={user.user_id === currentUser?.id}
                                title="Cambiar rol"
                              >
                                <UserCog className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user)
                                  setIsStatusDialogOpen(true)
                                }}
                                disabled={user.user_id === currentUser?.id}
                                title={user.is_active ? "Inhabilitar usuario" : "Habilitar usuario"}
                              >
                                {user.is_active ? (
                                  <UserX className="h-4 w-4 text-destructive" />
                                ) : (
                                  <UserCheck className="h-4 w-4 text-green-600" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Role Change Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
            <DialogDescription>
              Selecciona el nuevo rol para {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nuevo Rol</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Usuario</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="moderator">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Vendedor</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center space-x-2">
                      <Crown className="h-4 w-4" />
                      <span>Administrador</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="gradient" onClick={handleRoleChange}>
                Actualizar Rol
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileDialogOpen} onOpenChange={setIsEditProfileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Perfil de Usuario</DialogTitle>
            <DialogDescription>
              Actualiza la información del perfil de {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre Completo</Label>
              <Input
                id="edit-name"
                value={editingProfile.full_name}
                onChange={(e) => setEditingProfile(prev => ({
                  ...prev,
                  full_name: e.target.value
                }))}
                placeholder="Nombre completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editingProfile.email}
                onChange={(e) => setEditingProfile(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
                placeholder="Email del usuario"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Teléfono</Label>
              <Input
                id="edit-phone"
                value={editingProfile.phone}
                onChange={(e) => setEditingProfile(prev => ({
                  ...prev,
                  phone: e.target.value
                }))}
                placeholder="Número de teléfono"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditProfileDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="gradient" onClick={handleEditProfile}>
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New User Dialog */}
      <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Completa la información para crear un nuevo usuario en el sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-email">Email *</Label>
              <Input
                id="new-email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
                placeholder="usuario@empresa.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-name">Nombre Completo *</Label>
              <Input
                id="new-name"
                value={newUser.full_name}
                onChange={(e) => setNewUser(prev => ({
                  ...prev,
                  full_name: e.target.value
                }))}
                placeholder="Nombre completo del usuario"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-phone">Teléfono</Label>
              <Input
                id="new-phone"
                value={newUser.phone}
                onChange={(e) => setNewUser(prev => ({
                  ...prev,
                  phone: e.target.value
                }))}
                placeholder="Número de teléfono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-role">Rol *</Label>
              <Select 
                value={newUser.role} 
                onValueChange={(value: 'admin' | 'moderator' | 'user') => 
                  setNewUser(prev => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Usuario</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="moderator">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Vendedor</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center space-x-2">
                      <Crown className="h-4 w-4" />
                      <span>Administrador</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-sm text-muted-foreground">
                <strong>Nota:</strong> Se generará una contraseña genérica: <code>Usuario123!</code>
                <br />
                El usuario deberá cambiarla en su primer acceso.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsNewUserDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                variant="gradient" 
                onClick={handleCreateUser}
                disabled={!newUser.email || !newUser.full_name}
              >
                Crear Usuario
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.is_active ? 'Inhabilitar Usuario' : 'Habilitar Usuario'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.is_active 
                ? `¿Estás seguro de que quieres inhabilitar a ${selectedUser?.full_name || selectedUser?.email}? El usuario no podrá acceder al sistema.`
                : `¿Estás seguro de que quieres habilitar a ${selectedUser?.full_name || selectedUser?.email}? El usuario podrá acceder al sistema nuevamente.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleUserStatus}>
              {selectedUser?.is_active ? 'Inhabilitar' : 'Habilitar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Users