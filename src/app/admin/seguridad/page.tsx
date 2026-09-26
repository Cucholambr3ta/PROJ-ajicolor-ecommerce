import { getTotpStatus } from "@/lib/actions/auth-2fa";
import SeguridadPageClient from "./SeguridadPageClient";

export const dynamic = "force-dynamic";

export default async function SeguridadPage() {
  const { totpEnabled } = await getTotpStatus();
  return <SeguridadPageClient totpEnabled={totpEnabled} />;
}
