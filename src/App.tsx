import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginTransition from "@/components/transitions/LoginTransition";
import LogoutTransition from "@/components/transitions/LogoutTransition";
import AnimatedLayout from "@/components/transitions/AnimatedLayout";
import { AppSidebar } from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
// import Index from "./pages/Index";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import MySales from "./pages/MySales";
import Users from "./pages/Users";
import Customers from "./pages/Customers";
import Categories from "./pages/Categories";
import Reports from "./pages/Reports";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import KioskView from "./pages/KioskView";
import VentyWidget from "@/components/venty/VentyWidget";
import SettingsPage from "./pages/Settings";

const queryClient = new QueryClient();

// Component to handle login/logout transitions
const AppContent = () => {
  const { 
    showLoginTransition, 
    showLogoutTransition, 
    userProfile, 
    userRole, 
    completeLoginTransition 
  } = useAuth();
  
  // Show logout transition
  if (showLogoutTransition) {
    return (
      <LogoutTransition 
        onComplete={() => {
          // Logout transition handles the navigation automatically
        }} 
      />
    );
  }
  
  // Show login transition
  if (showLoginTransition) {
    return (
      <LoginTransition
        userName={userProfile?.full_name || undefined}
        userRole={userRole || undefined}
        onComplete={completeLoginTransition}
      />
    );
  }
  
  return (
    <AnimatedLayout>
      <Routes>
        {/* Rutas de autenticación sin sidebar */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Rutas protegidas con sidebar */}
        <Route path="/*" element={
          <SidebarProvider>
            <div className="min-h-screen flex w-full bg-gradient-dashboard">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/" element={<Navigate to="/caja" replace />} />
                    <Route path="/caja" element={
                      <ProtectedRoute>
                        <KioskView />
                      </ProtectedRoute>
                    } />
                    <Route path="/kiosk" element={<Navigate to="/caja" replace />} />
                    <Route path="/my-sales" element={
                      <ProtectedRoute>
                        <MySales />
                      </ProtectedRoute>
                    } />
                    <Route path="/products" element={
                      <ProtectedRoute requiredRole="admin">
                        <Products />
                      </ProtectedRoute>
                    } />
                    <Route path="/sales" element={
                      <ProtectedRoute requiredRole="admin">
                        <Sales />
                      </ProtectedRoute>
                    } />
                    <Route path="/customers" element={
                      <ProtectedRoute>
                        <Customers />
                      </ProtectedRoute>
                    } />
                    <Route path="/users" element={
                      <ProtectedRoute requiredRole="admin">
                        <Users />
                      </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                      <ProtectedRoute requiredRole="admin">
                        <SettingsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/reports" element={
                      <ProtectedRoute requiredRole="admin">
                        <Reports />
                      </ProtectedRoute>
                    } />
                    <Route path="/categories" element={
                      <ProtectedRoute requiredRole="admin">
                        <Categories />
                      </ProtectedRoute>
                    } />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
              
              {/* Venty chat widget solo en rutas protegidas */}
              <VentyWidget />
            </div>
          </SidebarProvider>
        } />
      </Routes>
    </AnimatedLayout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange={false}
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;