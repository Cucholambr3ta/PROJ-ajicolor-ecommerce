export default function Loading() {
  return (
    <div className="min-h-screen bg-ajicolor-light flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-ajicolor-ink border-t-ajicolor-magenta rounded-full animate-spin" />
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Cargando...</p>
      </div>
    </div>
  );
}
