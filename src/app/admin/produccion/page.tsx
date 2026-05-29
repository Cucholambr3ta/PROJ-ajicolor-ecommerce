import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const estados = ["Todos", "Solicitado", "EnProceso", "Recibido", "RechazadoParcial"];

export default function ProduccionPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Cola de Producción</h1>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {estados.map((estado) => (
          <Badge key={estado} variant="outline" className="cursor-pointer hover:bg-gray-100">
            {estado}
          </Badge>
        ))}
      </div>
      <Card>
        <div className="p-4 text-center text-gray-500">
          No hay lotes de producción para mostrar.
        </div>
      </Card>
    </div>
  );
}
