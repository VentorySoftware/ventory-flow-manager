import { useState, useRef } from 'react'
import { Button } from '@/components/ui/enhanced-button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import NotificationPanel from '@/components/NotificationPanel'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import ThemeToggle from '@/components/ThemeToggle'
import { supabase } from '@/integrations/supabase/client'
import { 
  User, 
  Settings, 
  LogOut, 
  Crown, 
  Shield, 
  Camera,
  Moon,
  Sun,
  ChevronDown
} from 'lucide-react'
import { useTheme } from 'next-themes'

const UserProfileDropdown = () => {
  const { user, userRole, userProfile, signOut, hasRole } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSignOut = async () => {
    await signOut()
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const getRoleIcon = () => {
    switch (userRole) {
      case 'admin':
        return <Crown className="h-3 w-3" />
      case 'moderator':
        return <Shield className="h-3 w-3" />
      default:
        return <User className="h-3 w-3" />
    }
  }

  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'admin':
        return 'Admin'
      case 'moderator':
        return 'Vendedor'
      default:
        return 'Usuario'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona una imagen válida",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen debe ser menor a 5MB",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar.${fileExt}`

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      toast({
        title: "Éxito",
        description: "Foto de perfil actualizada correctamente",
      })

      // Refresh the page to show new avatar
      window.location.reload()

    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la foto de perfil",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center space-x-3 hover-scale transition-smooth h-auto p-2"
          >
            <div className="flex items-center space-x-2">
              <Badge 
                variant="outline" 
                className="flex items-center space-x-1 bg-gradient-card border-primary/20"
              >
                {getRoleIcon()}
                <span className="text-xs font-medium">{getRoleDisplayName()}</span>
              </Badge>
              <span className="text-sm font-medium text-foreground hidden lg:block">
                {userProfile?.full_name || user?.email}
              </span>
              <NotificationPanel />
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-80 p-0" align="end">
          {/* User Profile Section */}
          <div className="p-4 bg-gradient-card">
            <DropdownMenuLabel className="text-base font-heading font-semibold text-gradient mb-3">
              Mi Usuario
            </DropdownMenuLabel>
            
            <div className="flex items-center space-x-4">
              {/* Avatar with upload functionality */}
              <div className="relative group">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage 
                    src={userProfile?.avatar_url || undefined} 
                    alt={userProfile?.full_name || 'Usuario'} 
                  />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold text-lg">
                    {userProfile?.full_name 
                      ? getInitials(userProfile.full_name)
                      : user?.email?.charAt(0).toUpperCase()
                    }
                  </AvatarFallback>
                </Avatar>
                
                {/* Upload overlay */}
                <button
                  onClick={triggerFileInput}
                  disabled={uploading}
                  className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                >
                  <Camera className="h-5 w-5" />
                </button>
                
                {uploading && (
                  <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-1">
                <p className="font-medium text-foreground">
                  {userProfile?.full_name || 'Sin nombre'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user?.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {userProfile?.phone || 'Sin teléfono'}
                </p>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Theme Toggle */}
          <DropdownMenuItem onClick={toggleTheme} className="flex items-center space-x-3 p-3">
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span>Modo {theme === 'dark' ? 'claro' : 'oscuro'}</span>
          </DropdownMenuItem>

          {/* Settings - Solo para Admin */}
          {hasRole('admin') && (
            <DropdownMenuItem className="flex items-center space-x-3 p-3">
              <Settings className="h-4 w-4" />
              <span>Configuración del Sistema</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Sign Out */}
          <DropdownMenuItem 
            onClick={handleSignOut}
            className="flex items-center space-x-3 p-3 text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden file input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />
    </>
  )
}

export default UserProfileDropdown