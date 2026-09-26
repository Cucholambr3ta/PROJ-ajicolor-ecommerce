import { Instagram, Facebook } from "lucide-react";
import { getStoreSettings } from "@/lib/actions/settings";

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.83 14.13c-.25.7-1.45 1.34-2 1.42-.51.08-1.15.11-1.86-.12-.43-.14-.98-.32-1.69-.63-2.97-1.28-4.91-4.27-5.06-4.47-.15-.2-1.21-1.61-1.21-3.07 0-1.46.77-2.18 1.04-2.48.27-.3.6-.37.8-.37.2 0 .4 0 .58.01.19.01.44-.07.68.52.25.61.85 2.1.92 2.25.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.18-.31.4-.44.53-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.36 1.46.3.15.48.13.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.25.68-.15.27.1 1.75.83 2.05.98.3.15.5.22.57.35.08.13.08.75-.17 1.45z" />
    </svg>
  );
}

interface SocialLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export async function HeaderSocialIcons() {
  const settings = await getStoreSettings();

  const candidates: (SocialLink | "" | null)[] = [
    settings.instagram && {
      label: "Instagram",
      href: `https://instagram.com/${settings.instagram}`,
      icon: <Instagram className="h-[18px] w-[18px]" />,
    },
    settings.tiktok && {
      label: "TikTok",
      href: `https://www.tiktok.com/@${settings.tiktok}`,
      icon: <TikTokIcon />,
    },
    settings.whatsapp && {
      label: "WhatsApp",
      href: `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`,
      icon: <WhatsAppIcon />,
    },
    settings.facebook && {
      label: "Facebook",
      href: settings.facebook,
      icon: <Facebook className="h-[18px] w-[18px]" />,
    },
  ];
  const links = candidates.filter((l): l is SocialLink => Boolean(l));

  if (links.length === 0) return <div className="hidden lg:block" />;

  return (
    <div className="hidden lg:flex items-center gap-4">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          className="text-ajicolor-ink dark:text-neutral-100 hover:text-ajicolor-magenta transition-colors"
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}
