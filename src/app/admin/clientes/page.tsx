import { Card } from "@/components/ui/card";

export default function ClientesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
      </div>
      <Card>
        <div className="p-4 text-center text-gray-500">
          No hay clientes para mostrar.
        </div>
      </Card>
    </div>
  );
}
