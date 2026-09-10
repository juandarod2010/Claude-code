import type { Session } from '@supabase/supabase-js';
import { getSupabaseClient, supabaseConfigured } from './supabaseClient';

/**
 * Acceso al panel interno. Hay dos modos, y el que se usa depende de si
 * Supabase está configurado.
 *
 * 1. MODO CONTRASEÑA (por defecto, sin Supabase).
 *    Una contraseña en una variable de entorno. NO es seguridad: viaja dentro
 *    del bundle de JavaScript y cualquiera que abra el inspector la lee. Es un
 *    portero para que una visita casual no entre. Vale mientras los datos estén
 *    en el localStorage de tu propio navegador, porque no hay nada que robar.
 *
 * 2. MODO SESIÓN (cuando hay Supabase).
 *    Usuario y contraseña reales contra Supabase Auth. Es lo que hace que Row
 *    Level Security te deje LEER los leads: sin sesión, la clave anónima solo
 *    puede insertar. Aquí sí hay seguridad de verdad, y está en el servidor.
 *
 * Ver SUPABASE.md para crear tu usuario.
 */

export type AuthMode = 'password' | 'supabase';

export function authMode(): AuthMode {
  return supabaseConfigured ? 'supabase' : 'password';
}

/** Contraseña del modo 1. Solo se usa si NO hay Supabase. */
export function adminPassword(): string {
  return (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) || 'complyo-dev';
}

export interface AdminSession {
  email: string;
  /** 'password' = portero local. 'supabase' = sesión real con RLS detrás. */
  mode: AuthMode;
}

const LOCAL_KEY = 'complyo.admin';

// ---------------------------------------------------------------- Modo 1
function localSession(): AdminSession | null {
  if (typeof sessionStorage === 'undefined') return null;
  return sessionStorage.getItem(LOCAL_KEY) === '1'
    ? { email: 'operador (local)', mode: 'password' }
    : null;
}

// ---------------------------------------------------------------- Común
export async function currentSession(): Promise<AdminSession | null> {
  const client = getSupabaseClient();
  if (!client) return localSession();

  const { data } = await client.auth.getSession();
  return sessionToAdmin(data.session);
}

function sessionToAdmin(session: Session | null): AdminSession | null {
  if (!session?.user?.email) return null;
  return { email: session.user.email, mode: 'supabase' };
}

export interface SignInInput {
  email?: string;
  password: string;
}

export interface SignInResult {
  session: AdminSession | null;
  error: string | null;
}

export async function signIn({ email, password }: SignInInput): Promise<SignInResult> {
  const client = getSupabaseClient();

  if (!client) {
    if (password === adminPassword()) {
      try {
        sessionStorage.setItem(LOCAL_KEY, '1');
      } catch {
        // Sin sessionStorage el panel funciona, pero pedirá la clave al recargar.
      }
      return { session: { email: 'operador (local)', mode: 'password' }, error: null };
    }
    return { session: null, error: 'Contraseña incorrecta.' };
  }

  if (!email) return { session: null, error: 'Escribe tu correo.' };

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    // No se distingue "usuario no existe" de "contraseña mal": decirlo sería
    // regalar información a quien esté probando correos.
    return { session: null, error: 'No se ha podido iniciar sesión. Revisa el correo y la contraseña.' };
  }
  return { session: sessionToAdmin(data.session), error: null };
}

export async function signOut(): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    await client.auth.signOut();
    return;
  }
  try {
    sessionStorage.removeItem(LOCAL_KEY);
  } catch {
    // Nada que limpiar.
  }
}

/**
 * Avisa cuando la sesión cambia (expira, se refresca, se cierra en otra
 * pestaña). Devuelve la función para dejar de escuchar.
 */
export function onSessionChange(callback: (session: AdminSession | null) => void): () => void {
  const client = getSupabaseClient();
  if (!client) return () => {};
  const { data } = client.auth.onAuthStateChange((_event, session) => {
    callback(sessionToAdmin(session));
  });
  return () => data.subscription.unsubscribe();
}
