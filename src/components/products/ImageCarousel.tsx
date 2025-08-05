import { useState } from 'react'
import { Button } from '@/components/ui/enhanced-button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, X, Star } from 'lucide-react'

interface ImageCarouselProps {
  images: string[]
  primaryImage?: string
  productName?: string
  className?: string
  showControls?: boolean
  aspectRatio?: 'square' | 'landscape' | 'portrait'
  size?: 'sm' | 'md' | 'lg'
}

const ImageCarousel = ({ 
  images, 
  primaryImage,
  productName = 'Producto',
  className = '',
  showControls = true,
  aspectRatio = 'square',
  size = 'md'
}: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showFullscreen, setShowFullscreen] = useState(false)

  if (!images || images.length === 0) {
    return (
      <Card className={`${className}`}>
        <CardContent className={`p-0 ${getAspectClass(aspectRatio)}`}>
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-sm">Sin imagen</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sort images to show primary first
  const sortedImages = primaryImage 
    ? [primaryImage, ...images.filter(img => img !== primaryImage)]
    : images

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % sortedImages.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  function getAspectClass(aspect: string) {
    switch (aspect) {
      case 'landscape': return 'aspect-[4/3]'
      case 'portrait': return 'aspect-[3/4]'
      default: return 'aspect-square'
    }
  }

  function getSizeClass(size: string) {
    switch (size) {
      case 'sm': return 'w-24 h-24'
      case 'lg': return 'w-96 h-96'
      default: return 'w-48 h-48'
    }
  }

  return (
    <>
      <Card className={`relative overflow-hidden ${className}`}>
        <CardContent className={`p-0 ${getAspectClass(aspectRatio)}`}>
          {/* Main Image */}
          <div className="relative w-full h-full">
            <img
              src={sortedImages[currentIndex]}
              alt={`${productName} - Imagen ${currentIndex + 1}`}
              className="w-full h-full object-cover cursor-pointer transition-transform hover:scale-105"
              onClick={() => setShowFullscreen(true)}
            />

            {/* Primary Badge */}
            {sortedImages[currentIndex] === primaryImage && (
              <Badge className="absolute top-2 left-2 bg-yellow-500">
                <Star className="h-3 w-3 mr-1" />
                Principal
              </Badge>
            )}

            {/* Navigation Arrows */}
            {showControls && sortedImages.length > 1 && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 opacity-80 hover:opacity-100"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 opacity-80 hover:opacity-100"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Image Counter */}
            {sortedImages.length > 1 && (
              <Badge 
                variant="secondary" 
                className="absolute bottom-2 right-2 text-xs"
              >
                {currentIndex + 1} / {sortedImages.length}
              </Badge>
            )}
          </div>
        </CardContent>

        {/* Thumbnail Navigation */}
        {showControls && sortedImages.length > 1 && (
          <div className="p-2 bg-muted/30">
            <div className="flex gap-1 justify-center">
              {sortedImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`relative w-8 h-8 rounded overflow-hidden border-2 transition-all ${
                    index === currentIndex 
                      ? 'border-primary scale-110' 
                      : 'border-transparent opacity-60 hover:opacity-80'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Miniatura ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {image === primaryImage && (
                    <Star className="absolute top-0 right-0 h-2 w-2 text-yellow-500 fill-current" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-[90vw] max-h-[90vh]">
            {/* Close Button */}
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-4 right-4 z-10 h-10 w-10 p-0"
              onClick={() => setShowFullscreen(false)}
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Navigation in Fullscreen */}
            {sortedImages.length > 1 && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 h-12 w-12 p-0 z-10"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 h-12 w-12 p-0 z-10"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Fullscreen Image */}
            <img
              src={sortedImages[currentIndex]}
              alt={`${productName} - Imagen ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Image Info */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <Badge variant="secondary" className="text-sm">
                {productName} - {currentIndex + 1} de {sortedImages.length}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ImageCarousel