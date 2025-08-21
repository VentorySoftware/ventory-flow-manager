import { 
  PackageOpen,
  Package,
  ShoppingCart,
  LayoutGrid,
  Tags,
  Receipt,
  BarChart3,
  Menu
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const { hasRole } = useAuth()
  const { state, toggleSidebar } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname

  const collapsed = state === "collapsed"

  const navigation = [
    { name: "Caja", icon: LayoutGrid, path: "/caja", category: "main" },
    { name: "Mis Ventas", icon: Receipt, path: "/my-sales", category: "main" },
    ...(hasRole('admin') ? [
      { name: "Reportes", icon: BarChart3, path: "/reports", category: "admin" },
      { name: "Productos", icon: Package, path: "/products", category: "admin" },
      { name: "Categorías", icon: Tags, path: "/categories", category: "admin" },
      { name: "Ventas", icon: ShoppingCart, path: "/sales", category: "admin" },
    ] : []),
  ]

  const mainItems = navigation.filter(item => item.category === "main")
  const adminItems = navigation.filter(item => item.category === "admin")

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-primary-foreground font-medium border-r-2 border-sidebar-primary relative overflow-visible before:absolute before:inset-[-4px] before:bg-gradient-to-r before:from-sidebar-primary/20 before:to-sidebar-primary/10 before:rounded-lg before:blur-md before:z-[-1] before:opacity-80" 
      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"

  return (
    <Sidebar
      className={`
        ${collapsed 
          ? "w-20 sticky top-0 h-screen shadow-2xl" 
          : "w-64 sticky top-0 h-screen"
        } 
        transition-all duration-300 ease-in-out 
        border-r border-sidebar-border
        bg-sidebar/95 backdrop-blur-md
      `}
      collapsible="icon"
    >
      <SidebarHeader className={`border-b border-sidebar-border ${collapsed ? 'h-16 px-2 py-0' : 'p-4'}`}>
        {collapsed ? (
          <div className="flex items-center justify-center w-full h-full">
            {/* Botón de hamburguesa centrado cuando está colapsado */}
            <button
              onClick={() => toggleSidebar()}
              className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-sidebar-accent/50 transition-colors"
              title="Expandir sidebar"
            >
              <Menu className="h-5 w-5 text-sidebar-foreground" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {/* Botón de hamburguesa para colapsar sidebar */}
            <button
              onClick={() => toggleSidebar()}
              className="p-2 rounded-md hover:bg-sidebar-accent/50 transition-colors"
              title="Colapsar sidebar"
            >
              <Menu className="h-5 w-5 text-sidebar-foreground" />
            </button>

            {/* Logo */}
            <div className="h-8 w-8 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow animate-glow">
              <PackageOpen className="h-5 w-5 text-primary-foreground" />
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-heading font-bold text-gradient">
                Ventory Manager
              </span>
              <span className="text-xs text-sidebar-foreground/70">
                Sistema de Gestión
              </span>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className={`${collapsed ? "px-0" : "px-2"} py-4`}>
        {/* Sección Principal */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs font-medium uppercase tracking-wider mb-2">
              Principal
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild className={`${collapsed ? "h-12 w-full p-0" : "h-10 px-3"}`}>
                      <NavLink 
                        to={item.path} 
                        end 
                        className={({ isActive }) => `
                          ${getNavCls({ isActive })}
                          flex items-center transition-all duration-200
                          ${collapsed 
                            ? "justify-center w-full h-full mx-1 rounded-lg" 
                            : "justify-start px-3 rounded-lg"
                          }
                        `}
                        title={collapsed ? item.name : undefined}
                      >
                        {collapsed ? (
                          <item.icon className="h-6 w-6 shrink-0" />
                        ) : (
                          <>
                            <item.icon className="h-5 w-5 shrink-0" />
                            <span className="text-sm font-medium ml-3">
                              {item.name}
                            </span>
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sección Administración */}
        {adminItems.length > 0 && (
          <SidebarGroup className="mt-6">
            {!collapsed && (
              <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs font-medium uppercase tracking-wider mb-2">
                Administración
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild className={`${collapsed ? "h-12 w-full p-0" : "h-10 px-3"}`}>
                      <NavLink 
                        to={item.path} 
                        end 
                        className={({ isActive }) => `
                          ${getNavCls({ isActive })}
                          flex items-center transition-all duration-200
                          ${collapsed 
                            ? "justify-center w-full h-full mx-1 rounded-lg" 
                            : "justify-start px-3 rounded-lg"
                          }
                        `}
                        title={collapsed ? item.name : undefined}
                      >
                        {collapsed ? (
                          <item.icon className="h-6 w-6 shrink-0" />
                        ) : (
                          <>
                            <item.icon className="h-5 w-5 shrink-0" />
                            <span className="text-sm font-medium ml-3">
                              {item.name}
                            </span>
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
