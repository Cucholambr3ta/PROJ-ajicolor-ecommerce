import Image from "next/image";

export function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  return <Image src="/logo/logo.png" alt="Ajicolor" width={200} height={80} className={className} priority />;
}

export function LogoIcon({ className = "h-8 w-8" }: { className?: string }) {
  return <Image src="/logo/icono.png" alt="Ajicolor" width={64} height={64} className={className} />;
}
