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
      ? "bg-sidebar-accent text-sidebar-primary-foreground font-medium border-r-2 border-sidebar-primary" 
      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"

  return (
    <Sidebar
      className={`
        ${collapsed ? "w-16" : "w-64"} 
        transition-all duration-300 ease-in-out 
        border-r border-sidebar-border
        bg-sidebar/95 backdrop-blur-md
      `}
      collapsible="icon"
    >
      <SidebarHeader className={`border-b border-sidebar-border ${collapsed ? 'p-2' : 'p-4'}`}>
        <div className="flex items-center gap-2 justify-center">
          {/* Botón de hamburguesa para colapsar/expandir sidebar */}
          <button
            onClick={() => toggleSidebar()}
            className={`${collapsed ? 'p-1' : 'p-2'} rounded-md hover:bg-sidebar-accent/50 transition-colors`}
            title={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          >
            <Menu className="h-5 w-5 text-sidebar-foreground" />
          </button>

          {/* Logo */}
          <div className={`${collapsed ? 'h-6 w-6' : 'h-8 w-8'} bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow animate-glow`}>
            <PackageOpen className={`${collapsed ? 'h-3 w-3' : 'h-5 w-5'} text-primary-foreground`} />
          </div>

          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-heading font-bold text-gradient">
                Ventory Manager
              </span>
              <span className="text-xs text-sidebar-foreground/70">
                Sistema de Gestión
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
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
                  <SidebarMenuButton asChild className="h-10 px-3">
                    <NavLink 
                      to={item.path} 
                      end 
                      className={({ isActive }) => `
                        ${getNavCls({ isActive })}
                        flex items-center gap-3 rounded-lg transition-all duration-200
                        ${collapsed ? "justify-center" : "justify-start"}
                      `}
                      title={collapsed ? item.name : undefined}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && (
                        <span className="text-sm font-medium">
                          {item.name}
                        </span>
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
                    <SidebarMenuButton asChild className="h-10 px-3">
                      <NavLink 
                        to={item.path} 
                        end 
                        className={({ isActive }) => `
                          ${getNavCls({ isActive })}
                          flex items-center gap-3 rounded-lg transition-all duration-200
                          ${collapsed ? "justify-center" : "justify-start"}
                        `}
                        title={collapsed ? item.name : undefined}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && (
                          <span className="text-sm font-medium">
                            {item.name}
                          </span>
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
