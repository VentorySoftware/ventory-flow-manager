import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/enhanced-button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { Users as UsersIcon, Search, Shield, UserCog, Crown, User, Edit, Save, X } from 'lucide-react'
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
  created_at: string
  profiles?: {
    email: string
  }
}

interface UserWithRole extends UserProfile {
  role: string
  email: string
}

const Users = () => {
  const [users, setUsers] = useState<UserWithRole[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false)
  const [newRole, setNewRole] = useState('')
  const [editingProfile, setEditingProfile] = useState({
    full_name: '',
    phone: ''
  })
  const { toast } = useToast()
  const { hasRole, user: currentUser } = useAuth()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      // Fetch all profiles with their roles - using a simpler approach
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          full_name,
          avatar_url,
          phone,
          created_at
        `)
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Fetch user roles separately
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')

      if (rolesError) throw rolesError

      // For now, we'll create a simple user list without email from auth
      // In production, you'd want to store email in profiles or use a server function
      const usersWithRoles: UserWithRole[] = profilesData?.map(profile => {
        const userRole = rolesData?.find(r => r.user_id === profile.user_id)
        
        return {
          ...profile,
          email: `user-${profile.user_id.slice(-8)}@domain.com`, // Placeholder email
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
      const { error } = await supabase
        .from('user_roles')
        .upsert({
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
          phone: editingProfile.phone
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
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="flex items-center space-x-2">
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
                  Usuarios
                </CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {users.filter(user => user.role === 'user').length}
                </div>
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
                      <TableHead>Fecha de Registro</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
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
                          <TableCell>{user.email}</TableCell>
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
                                    phone: user.phone || ''
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
              Actualiza la información de {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre Completo</label>
              <Input
                value={editingProfile.full_name}
                onChange={(e) => setEditingProfile(prev => ({
                  ...prev,
                  full_name: e.target.value
                }))}
                placeholder="Ingresa el nombre completo"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Teléfono</label>
              <Input
                value={editingProfile.phone}
                onChange={(e) => setEditingProfile(prev => ({
                  ...prev,
                  phone: e.target.value
                }))}
                placeholder="Ingresa el número de teléfono"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditProfileDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button variant="gradient" onClick={handleEditProfile}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Users