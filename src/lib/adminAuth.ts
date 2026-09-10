/**
 * Contraseña del panel interno.
 *
 * AVISO EXPLÍCITO: esto NO es seguridad. La contraseña viaja dentro del bundle
 * de JavaScript y cualquiera que sepa mirar puede leerla. Sirve para que una
 * visita casual no entre. La protección real de los datos está en Row Level
 * Security en Supabase. Ver DECISIONS.md y NEXT-STEPS.md.
 */
export function adminPassword(): string {
  return (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) || 'complyo-dev';
}
