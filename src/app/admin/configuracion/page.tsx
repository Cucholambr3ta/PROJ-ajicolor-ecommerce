import { getStoreSettings } from "@/lib/actions/settings";
import ConfiguracionFormClient from "./ConfiguracionFormClient";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const settings = await getStoreSettings();

  return (
    <ConfiguracionFormClient
      settings={{
        razonSocial: settings.razonSocial ?? "",
        rut: settings.rut ?? "",
        direccionLegal: settings.direccionLegal ?? "",
        emailContacto: settings.emailContacto ?? "",
        telefonoContacto: settings.telefonoContacto ?? "",
        whatsapp: settings.whatsapp ?? "",
        instagram: settings.instagram ?? "",
        facebook: settings.facebook ?? "",
        tiktok: settings.tiktok ?? "",
        horarioAtencion: settings.horarioAtencion ?? "",
        bancoTitular: settings.bancoTitular ?? "",
        bancoRut: settings.bancoRut ?? "",
        bancoNombre: settings.bancoNombre ?? "",
        bancoTipoCuenta: settings.bancoTipoCuenta ?? "",
        bancoNumeroCuenta: settings.bancoNumeroCuenta ?? "",
        bancoEmail: settings.bancoEmail ?? "",
        costoEnvioCorreos: Number(settings.costoEnvioCorreos),
        plazoProduccionDias: settings.plazoProduccionDias,
      }}
    />
  );
}
