import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-neutral-900 border-t-2 border-ajicolor-ink">
      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div>
          <Logo className="h-8 w-auto mb-4" />
          <p className="text-xs text-gray-500 dark:text-neutral-400 leading-relaxed">
            Poleras de bandas para melómanos. Producto Ajicolor, hecho en Chile.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Categorías</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-neutral-300">
            <li>
              <Link href="/" className="hover:text-ajicolor-magenta">
                Bandas
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Cuenta</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-neutral-300">
            <li>
              <Link href="/login-cliente" className="hover:text-ajicolor-magenta">
                Iniciar sesión
              </Link>
            </li>
            <li>
              <Link href="/registro" className="hover:text-ajicolor-magenta">
                Crear cuenta
              </Link>
            </li>
            <li>
              <Link href="/carrito" className="hover:text-ajicolor-magenta">
                Mi carrito
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Ayuda</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-neutral-300">
            <li>
              <Link href="/contacto" className="hover:text-ajicolor-magenta">
                Contacto
              </Link>
            </li>
            <li>
              <Link href="/devoluciones" className="hover:text-ajicolor-magenta">
                Cambios y devoluciones
              </Link>
            </li>
            <li>
              <Link href="/terminos" className="hover:text-ajicolor-magenta">
                Términos y condiciones
              </Link>
            </li>
            <li>
              <Link href="/privacidad" className="hover:text-ajicolor-magenta">
                Política de privacidad
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Síguenos</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-neutral-300">
            <li>
              <a
                href="https://instagram.com/el_aji_color_estampados"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ajicolor-magenta"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/search/top?q=el%20aji%20color%20dise%C3%B1o%20y%20estampados"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ajicolor-magenta"
              >
                Facebook
              </a>
            </li>
            <li>
              <a
                href="https://www.tiktok.com/@el.aji.color.esta"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ajicolor-magenta"
              >
                TikTok
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-neutral-700 py-6">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-400 dark:text-neutral-500">© {new Date().getFullYear()} Ajicolor. Todos los derechos reservados.</p>
          <p className="text-xs text-gray-400 dark:text-neutral-500">Compra protegida bajo la Ley 19.496 de Protección al Consumidor (Chile)</p>
        </div>
      </div>
    </footer>
  );
}
