import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import MySales from "./pages/MySales";
import Users from "./pages/Users";
import Customers from "./pages/Customers";
import Categories from "./pages/Categories";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import KioskView from "./pages/KioskView";
import VentyWidget from "@/components/venty/VentyWidget";
import SettingsPage from "./pages/Settings";

const queryClient = new QueryClient();

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
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
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
            <Route path="/categories" element={
              <ProtectedRoute requiredRole="admin">
                <Categories />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
          {/* Venty chat widget is global */}
          {/* ... keep existing code (providers and routes above) */}
          <VentyWidget />
        </NotificationProvider>
      </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
</QueryClientProvider>
);

export default App;