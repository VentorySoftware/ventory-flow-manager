import { useState, useCallback, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface KioskImageCarouselProps {
  images: string[]
  primaryImage?: string
  productName?: string
  className?: string
  onImageClick?: () => void
}

const KioskImageCarousel = ({ 
  images, 
  primaryImage,
  productName = 'Producto',
  className = '',
  onImageClick
}: KioskImageCarouselProps) => {
  // Optimizar el orden de imágenes sin crear nuevos arrays
  const sortedImages = useMemo(() => {
    if (!images || images.length === 0) return []
    
    if (primaryImage && images.includes(primaryImage)) {
      const filtered = images.filter(img => img !== primaryImage)
      return [primaryImage, ...filtered]
    }
    return images
  }, [images, primaryImage])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isNavigating, setIsNavigating] = useState(false)

  if (!sortedImages || sortedImages.length === 0) {
    return (
      <Card className={`${className} overflow-hidden`}>
        <CardContent className="p-0 aspect-square">
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Package className="h-16 w-16 text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const nextImage = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (isNavigating) return
    
    setIsNavigating(true)
    setCurrentIndex((prev) => (prev + 1) % sortedImages.length)
    
    // Usar setTimeout más corto para mejor respuesta
    setTimeout(() => setIsNavigating(false), 100)
  }, [sortedImages.length, isNavigating])

  const prevImage = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (isNavigating) return
    
    setIsNavigating(true)
    setCurrentIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length)
    
    setTimeout(() => setIsNavigating(false), 100)
  }, [sortedImages.length, isNavigating])

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Prevenir múltiples clics rápidos
    if (isNavigating) return
    
    if (onImageClick) {
      onImageClick()
    }
  }, [isNavigating, onImageClick])

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <CardContent className="p-0 aspect-square">
        <div className="relative w-full h-full">
          {/* Imagen principal con optimización */}
          <img
            key={`kiosk-image-${currentIndex}`}
            src={sortedImages[currentIndex]}
            alt={`${productName} - Imagen ${currentIndex + 1}`}
            className="w-full h-full object-cover cursor-pointer transition-transform duration-200 hover:scale-105"
            onClick={handleImageClick}
            loading="lazy"
            decoding="async"
          />

          {/* Badge de imagen principal */}
          {sortedImages[currentIndex] === primaryImage && (
            <Badge className="absolute top-2 left-2 bg-yellow-500 text-xs">
              Principal
            </Badge>
          )}

          {/* Controles de navegación - solo si hay más de una imagen */}
          {sortedImages.length > 1 && (
            <>
              <button
                className="absolute left-1 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all duration-150 z-10"
                onClick={prevImage}
                disabled={isNavigating}
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all duration-150 z-10"
                onClick={nextImage}
                disabled={isNavigating}
                aria-label="Siguiente imagen"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Indicador de imagen actual */}
              <div className="absolute bottom-2 right-2">
                <Badge className="bg-black/50 text-white text-xs px-2 py-1">
                  {currentIndex + 1}/{sortedImages.length}
                </Badge>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default KioskImageCarousel
