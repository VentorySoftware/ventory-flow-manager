import { useState } from 'react'
import { Button } from '@/components/ui/enhanced-button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useNotificationContext } from '@/contexts/NotificationContext'
import { 
  Bell, 
  BellRing, 
  X, 
  Settings, 
  CheckCheck,
  Trash2,
  Package,
  ShoppingCart,
  Users,
  Monitor
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const NotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false)
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    requestBrowserPermissions,
    canShowBrowserNotifications
  } = useNotificationContext()

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'inventory':
        return <Package className="h-4 w-4" />
      case 'sales':
        return <ShoppingCart className="h-4 w-4" />
      case 'users':
        return <Users className="h-4 w-4" />
      case 'system':
        return <Monitor className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600 dark:text-green-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'error':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-blue-600 dark:text-blue-400'
    }
  }

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative hover-scale">
          {unreadCount > 0 ? (
            <BellRing className="h-4 w-4 text-primary" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-elegant">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notificaciones</CardTitle>
              <div className="flex items-center space-x-2">
                {!canShowBrowserNotifications && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={requestBrowserPermissions}
                    className="text-xs"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Activar
                  </Button>
                )}
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Marcar todas
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllNotifications}
                  className="text-xs text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {!canShowBrowserNotifications && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
                💡 Activa las notificaciones del navegador para no perderte nada importante
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay notificaciones</p>
                <p className="text-xs">Te avisaremos cuando tengas algo nuevo</p>
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-1">
                  {notifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div
                        className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                          !notification.read ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className={`mt-1 ${getTypeColor(notification.type)}`}>
                              {getCategoryIcon(notification.category)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h4 className="text-sm font-medium text-foreground">
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <div className="h-2 w-2 bg-primary rounded-full" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 break-words">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatDistanceToNow(notification.timestamp, { 
                                  addSuffix: true, 
                                  locale: es 
                                })}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              clearNotification(notification.id)
                            }}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {index < notifications.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}

export default NotificationPanel