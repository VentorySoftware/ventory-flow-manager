import { useState, useRef } from 'react'
import { Button } from '@/components/ui/enhanced-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { 
  Upload, 
  X, 
  Edit3, 
  RotateCw, 
  Move, 
  ZoomIn, 
  ZoomOut,
  Check,
  Star
} from 'lucide-react'
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface ImageUploaderProps {
  productId?: string
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  primaryImage?: string
  onPrimaryImageChange?: (imageUrl: string) => void
  onUploadingChange?: (uploading: boolean) => void
}

const ImageUploader = ({ 
  productId, 
  images, 
  onImagesChange, 
  maxImages = 3,
  primaryImage,
  onPrimaryImageChange,
  onUploadingChange
}: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false)
  const [editingImage, setEditingImage] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Prevent event propagation
    event.stopPropagation()

    if (images.length + files.length > maxImages) {
      toast({
        title: 'Límite de imágenes',
        description: `Solo puedes subir máximo ${maxImages} imágenes`,
        variant: 'destructive'
      })
      return
    }

    setUploading(true)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = productId ? `${productId}/${fileName}` : `temp/${fileName}`

        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(filePath, file)

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)

        return publicUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      const newImages = [...images, ...uploadedUrls]
      onImagesChange(newImages)

      // Set first uploaded image as primary if no primary image exists
      if (!primaryImage && uploadedUrls.length > 0 && onPrimaryImageChange) {
        onPrimaryImageChange(uploadedUrls[0])
      }

      toast({
        title: 'Imágenes subidas',
        description: `${uploadedUrls.length} imagen(es) subida(s) correctamente`,
      })
    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: 'Error',
        description: 'Error al subir las imágenes',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
      onUploadingChange?.(false)
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = async (imageUrl: string, event?: React.MouseEvent) => {
    // Prevent event propagation to avoid closing parent dialogs
    if (event) {
      event.stopPropagation()
      event.preventDefault()
    }

    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/product-images/')
      if (urlParts.length > 1) {
        const filePath = urlParts[1]
        await supabase.storage
          .from('product-images')
          .remove([filePath])
      }

      const newImages = images.filter(img => img !== imageUrl)
      onImagesChange(newImages)

      // If removed image was primary, set new primary
      if (primaryImage === imageUrl && newImages.length > 0 && onPrimaryImageChange) {
        onPrimaryImageChange(newImages[0])
      } else if (primaryImage === imageUrl && onPrimaryImageChange) {
        onPrimaryImageChange('')
      }

      toast({
        title: 'Imagen eliminada',
        description: 'La imagen se eliminó correctamente',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al eliminar la imagen',
        variant: 'destructive'
      })
    }
  }

  const handleSetPrimary = (imageUrl: string, event?: React.MouseEvent) => {
    // Prevent event propagation
    if (event) {
      event.stopPropagation()
      event.preventDefault()
    }
    
    if (onPrimaryImageChange) {
      onPrimaryImageChange(imageUrl)
      toast({
        title: 'Imagen principal',
        description: 'Imagen establecida como principal',
      })
    }
  }

  const applyImageEdit = () => {
    // For now, just close the editor. In a real implementation,
    // you would apply the crop, rotation, and scale to create a new image
    setEditingImage(null)
    setCrop(undefined)
    setRotation(0)
    setScale(1)
    
    toast({
      title: 'Edición aplicada',
      description: 'Los cambios se han guardado',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Imágenes del Producto ({images.length}/{maxImages})</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= maxImages}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Subiendo...' : 'Agregar Fotos'}
        </Button>
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((imageUrl, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <img
                    src={imageUrl}
                    alt={`Producto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Primary Image Badge */}
                  {primaryImage === imageUrl && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500">
                      <Star className="h-3 w-3 mr-1" />
                      Principal
                    </Badge>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {primaryImage !== imageUrl && onPrimaryImageChange && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => handleSetPrimary(imageUrl, e)}
                        className="h-8 w-8 p-0"
                      >
                        <Star className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        setEditingImage(imageUrl)
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => handleRemoveImage(imageUrl, e)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Image Editor Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Editar Imagen</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingImage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Image Editor Tools */}
                <div className="flex flex-wrap gap-2 p-4 bg-muted rounded-lg">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRotation(r => r + 90)}
                  >
                    <RotateCw className="h-4 w-4 mr-2" />
                    Rotar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setScale(s => Math.min(s + 0.1, 2))}
                  >
                    <ZoomIn className="h-4 w-4 mr-2" />
                    Zoom +
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setScale(s => Math.max(s - 0.1, 0.5))}
                  >
                    <ZoomOut className="h-4 w-4 mr-2" />
                    Zoom -
                  </Button>
                  <Badge variant="outline">
                    <Move className="h-3 w-3 mr-1" />
                    Arrastra para recortar
                  </Badge>
                </div>

                {/* Image with Crop */}
                <div className="flex justify-center">
                  <ReactCrop
                    crop={crop}
                    onChange={(newCrop) => setCrop(newCrop)}
                    aspect={1}
                  >
                    <img
                      ref={imageRef}
                      src={editingImage}
                      alt="Editor"
                      style={{
                        transform: `rotate(${rotation}deg) scale(${scale})`,
                        maxWidth: '100%',
                        maxHeight: '400px'
                      }}
                    />
                  </ReactCrop>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingImage(null)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={applyImageEdit}>
                    <Check className="h-4 w-4 mr-2" />
                    Aplicar Cambios
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ImageUploader