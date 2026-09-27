import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";

export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ajicolor-light bg-[url('/fondo/fondo-claro.png')] bg-repeat [background-size:520px] [background-attachment:fixed] dark:bg-[var(--bg-light)] dark:bg-[url('/fondo/fondo-oscuro.png')] dark:bg-repeat dark:[background-size:520px] dark:[background-attachment:fixed] flex flex-col">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
