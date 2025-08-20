import { useState, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ImagePreviewModalProps {
  images: string[]
  currentIndex?: number
  isOpen: boolean
  onClose: () => void
  productName?: string
}

const ImagePreviewModal = ({ 
  images, 
  currentIndex = 0, 
  isOpen, 
  onClose, 
  productName = 'Producto'
}: ImagePreviewModalProps) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex)

  // Reset index when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(currentIndex)
    }
  }, [isOpen, currentIndex])

  const nextImage = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const prevImage = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        prevImage()
      } else if (e.key === 'ArrowRight') {
        nextImage()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose, prevImage, nextImage])

  // Cerrar al hacer clic fuera
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen || !images || images.length === 0) {
    return null
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-6xl max-h-[90vh] w-full mx-4">
        {/* Botón cerrar */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Contenedor de imagen */}
        <div className="relative flex items-center justify-center">
          <img
            src={images[activeIndex]}
            alt={`${productName} - Imagen ${activeIndex + 1}`}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            loading="lazy"
          />

          {/* Controles de navegación */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                onClick={prevImage}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                onClick={nextImage}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              {/* Indicador de imagen actual */}
              <Badge className="absolute bottom-4 right-4 bg-black/50 text-white">
                {activeIndex + 1} / {images.length}
              </Badge>
            </>
          )}
        </div>

        {/* Miniaturas si hay múltiples imágenes */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-4 justify-center overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                className={`flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                  index === activeIndex 
                    ? 'ring-2 ring-white scale-110' 
                    : 'opacity-70 hover:opacity-100'
                }`}
                onClick={() => setActiveIndex(index)}
              >
                <img
                  src={image}
                  alt={`Miniatura ${index + 1}`}
                  className="w-16 h-16 object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ImagePreviewModal
