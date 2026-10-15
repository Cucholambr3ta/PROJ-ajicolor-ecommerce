import Image from "next/image";

export function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <span className={`inline-block transition-transform duration-200 ease-out hover:scale-110 ${className}`}>
      <Image
        src="/logo/logo.png"
        alt="Ajicolor"
        width={250}
        height={100}
        className="h-full w-auto"
        priority
      />
    </span>
  );
}

export function LogoIcon({ className = "h-8 w-8" }: { className?: string }) {
  return <Image src="/logo/icono.png" alt="Ajicolor" width={64} height={64} className={className} />;
}
