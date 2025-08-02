import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useNotifications, BrowserNotification } from '@/hooks/useNotifications'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

export interface AppNotification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  read: boolean
  category: 'inventory' | 'sales' | 'users' | 'system'
}

interface NotificationContextType {
  notifications: AppNotification[]
  unreadCount: number
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotification: (id: string) => void
  clearAllNotifications: () => void
  requestBrowserPermissions: () => Promise<void>
  canShowBrowserNotifications: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotificationContext = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const { showNotification, requestPermission, canShowNotifications } = useNotifications()
  const { user, userRole } = useAuth()

  // Simular algunas notificaciones iniciales
  useEffect(() => {
    if (user) {
      const initialNotifications: AppNotification[] = [
        {
          id: '1',
          title: 'Stock Bajo',
          message: 'El producto "Smartphone Galaxy" tiene solo 5 unidades restantes',
          type: 'warning',
          category: 'inventory',
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
          read: false
        },
        {
          id: '2', 
          title: 'Nueva Venta',
          message: 'Venta completada por $1,250.00 - Cliente: María González',
          type: 'success',
          category: 'sales',
          timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutos atrás
          read: false
        },
        {
          id: '3',
          title: 'Nuevo Usuario',
          message: 'Un nuevo usuario se ha registrado en el sistema',
          type: 'info',
          category: 'users',
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
          read: userRole !== 'admin' // Solo admin puede ver notificaciones de usuarios
        }
      ]
      
      // Filtrar notificaciones según el rol
      const filteredNotifications = initialNotifications.filter(notif => {
        if (notif.category === 'users' && userRole !== 'admin') {
          return false
        }
        return true
      })
      
      setNotifications(filteredNotifications)
    }
  }, [user, userRole])

  const addNotification = async (notificationData: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: AppNotification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    }

    setNotifications(prev => [newNotification, ...prev])

    // Mostrar notificación del navegador
    if (canShowNotifications) {
      const browserNotif: BrowserNotification = {
        title: `Ventory Manager - ${newNotification.title}`,
        message: newNotification.message,
        tag: newNotification.category
      }
      
      await showNotification(browserNotif)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const requestBrowserPermissions = async () => {
    try {
      await requestPermission()
    } catch (error) {
      console.error('Error requesting browser notification permissions:', error)
    }
  }

  const unreadCount = notifications.filter(notif => !notif.read).length

  // Escuchar cambios en tiempo real (ejemplo para ventas)
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sales'
        },
        (payload) => {
          addNotification({
            title: 'Nueva Venta Realizada',
            message: `Se ha registrado una nueva venta por $${payload.new.total}`,
            type: 'success',
            category: 'sales'
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    requestBrowserPermissions,
    canShowBrowserNotifications: canShowNotifications
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}