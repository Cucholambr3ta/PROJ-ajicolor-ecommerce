import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const estados = ["Todos", "Preparando", "Despachado", "EnTransito", "Entregado", "Devuelto"];

export default function EnviosPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Envíos</h1>
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
          No hay envíos para mostrar.
        </div>
      </Card>
    </div>
  );
}
