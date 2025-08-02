import { useState, useEffect } from 'react'

export interface BrowserNotification {
  title: string
  message: string
  icon?: string
  tag?: string
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Verificar si el navegador soporta notificaciones
    setIsSupported('Notification' in window)
    
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      throw new Error('Las notificaciones no son soportadas en este navegador')
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    } catch (error) {
      console.error('Error al solicitar permisos de notificación:', error)
      throw error
    }
  }

  const showNotification = async (notification: BrowserNotification) => {
    if (!isSupported) {
      console.warn('Notificaciones no soportadas')
      return
    }

    if (permission !== 'granted') {
      console.warn('Permisos de notificación no otorgados')
      return
    }

    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: notification.icon || '/favicon.ico',
        tag: notification.tag,
        requireInteraction: false,
        silent: false,
      })

      // Auto-cerrar después de 5 segundos
      setTimeout(() => {
        browserNotification.close()
      }, 5000)

      return browserNotification
    } catch (error) {
      console.error('Error al mostrar notificación:', error)
    }
  }

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    canShowNotifications: permission === 'granted' && isSupported
  }
}