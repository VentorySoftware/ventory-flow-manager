import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users as UsersIcon } from "lucide-react";
import Users from "./Users";

const SettingsPage = () => {
  useEffect(() => {
    document.title = "Configuración del Sistema | Ventory";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="min-h-screen bg-gradient-dashboard p-6 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-6">
          <header className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Settings className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Configuración del Sistema</h1>
              <p className="text-muted-foreground">Administra módulos y preferencias del sistema</p>
            </div>
          </header>

          <section aria-labelledby="settings-tabs">
            <Tabs defaultValue="users" className="w-full">
              <TabsList>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4" />
                  Usuarios
                </TabsTrigger>
              </TabsList>

              {/* Usuarios */}
              <TabsContent value="users" className="mt-4">
                {/* Renderizamos Users dentro, que ocultará su Navbar en modo embebido */}
                <Users />
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
