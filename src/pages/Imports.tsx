import { useEffect } from "react";
import { Upload } from "lucide-react";
import ImportModule from "./Settings/ImportModule";

const ImportsPage = () => {
  useEffect(() => {
    document.title = "Importaciones | Ventory";
  }, []);

  return (
    <div className="bg-background">
      <main className="bg-gradient-dashboard p-6 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-6">
          <header className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Upload className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Importaciones</h1>
              <p className="text-muted-foreground">Administra la importación de datos al sistema</p>
            </div>
          </header>

          <section aria-labelledby="imports-module">
            <ImportModule />
          </section>
        </div>
      </main>
    </div>
  );
};

export default ImportsPage;