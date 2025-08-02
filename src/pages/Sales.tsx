import Navbar from "@/components/Navbar"

const Sales = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="min-h-screen bg-gradient-dashboard p-6 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Ventas</h1>
            <p className="text-muted-foreground">
              Registra y gestiona tus ventas
            </p>
          </div>
          <div className="text-center text-muted-foreground">
            Sistema de ventas en desarrollo...
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;