import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/enhanced-button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  ChevronDown,
  Edit,
  Check,
  X
} from 'lucide-react'
import { useTheme } from 'next-themes'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

const UserProfileDropdown = () => {
  const { user, userRole, userProfile, signOut, hasRole } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [showCrop, setShowCrop] = useState(false)
  const [imageToCrop, setImageToCrop] = useState('')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

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

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1,
        width,
        height,
      ),
      width,
      height,
    )
    setCrop(crop)
  }, [])

  const getCroppedImg = useCallback((image: HTMLImageElement, pixelCrop: PixelCrop): Promise<Blob> => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.drawImage(
      image,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    )

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'))
          return
        }
        resolve(blob)
      }, 'image/jpeg', 0.95)
    })
  }, [])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

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

    const reader = new FileReader()
    reader.addEventListener('load', () => {
      setImageToCrop(reader.result?.toString() || '')
      setShowCrop(true)
    })
    reader.readAsDataURL(file)
  }

  const handleCropConfirm = async () => {
    if (!completedCrop || !imgRef.current || !user) return

    setUploading(true)

    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop)
      
      const fileExt = 'jpg'
      const fileName = `${user.id}/avatar.${fileExt}`

      // Upload cropped file to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedBlob, {
          upsert: true,
          contentType: 'image/jpeg'
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

      setShowCrop(false)
      setImageToCrop('')
      
      // Refresh the page to show new avatar
      setTimeout(() => {
        window.location.reload()
      }, 1000)

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

  const handleCropCancel = () => {
    setShowCrop(false)
    setImageToCrop('')
    setCrop(undefined)
    setCompletedCrop(undefined)
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleUpdateProfile = async () => {
    if (!user || !hasRole('admin')) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone
        })
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: "Éxito",
        description: "Perfil actualizado correctamente",
      })

      // No cerrar automáticamente el formulario
      // setEditingProfile(false)
      // window.location.reload()

    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = () => {
    setProfileForm({
      full_name: userProfile?.full_name || '',
      phone: userProfile?.phone || ''
    })
    setEditingProfile(true)
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
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-80 p-0" align="end">
          {/* User Profile Section */}
          <div className="p-4 bg-gradient-card">
            <div className="flex items-center space-x-4">
              {/* Simple Avatar Display */}
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

          {/* Mi Usuario */}
          <Dialog open={editingProfile} onOpenChange={setEditingProfile}>
            <DialogTrigger asChild>
              <DropdownMenuItem 
                onSelect={(e) => e.preventDefault()}
                onClick={openEditDialog}
                className="flex items-center space-x-3 p-3"
              >
                <User className="h-4 w-4" />
                <span>Mi Usuario</span>
                {hasRole('admin') && <Edit className="h-3 w-3 ml-auto" />}
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Mi Usuario</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Avatar Upload Section */}
                <div className="space-y-2">
                  <Label>Foto de Perfil</Label>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20 border-2 border-primary/20">
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
                    
                    <div className="flex-1">
                      <Button 
                        variant="outline" 
                        onClick={triggerFileInput}
                        disabled={uploading}
                        className="w-full"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {uploading ? 'Subiendo...' : 'Cambiar foto'}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        Máximo 5MB. Formatos: JPG, PNG, GIF
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Nombre Completo</Label>
                  {hasRole('admin') ? (
                    <Input
                      id="full_name"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Nombre completo"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{userProfile?.full_name || 'Sin nombre'}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  {hasRole('admin') ? (
                    <Input
                      id="phone"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Teléfono"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{userProfile?.phone || 'Sin teléfono'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <div className="flex items-center space-x-2">
                    {getRoleIcon()}
                    <span className="text-sm text-muted-foreground">{getRoleDisplayName()}</span>
                  </div>
                </div>

                {hasRole('admin') && (
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setEditingProfile(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleUpdateProfile}>
                      Guardar Cambios
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

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
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Image Crop Dialog */}
      <Dialog open={showCrop} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Recortar Imagen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {imageToCrop && (
              <div className="flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imageToCrop}
                    style={{ transform: 'scale(1) rotate(0deg)' }}
                    onLoad={onImageLoad}
                    className="max-h-96"
                  />
                </ReactCrop>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCropCancel} disabled={uploading}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleCropConfirm} disabled={uploading || !completedCrop}>
                <Check className="h-4 w-4 mr-2" />
                {uploading ? 'Guardando...' : 'Confirmar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default UserProfileDropdown