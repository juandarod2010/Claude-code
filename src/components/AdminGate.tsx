import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BRAND } from '../config/brand';
import {
  authMode,
  currentSession,
  onSessionChange,
  signIn,
  type AdminSession,
} from '../lib/adminAuth';

/**
 * Portero de las pantallas internas.
 * Pide correo y contraseña si hay Supabase; solo contraseña si no.
 * Ver src/lib/adminAuth.ts para la diferencia entre los dos modos.
 */
export default function AdminGate({
  children,
}: {
  children: (session: AdminSession) => ReactNode;
}) {
  const mode = authMode();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [checking, setChecking] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    currentSession()
      .then(setSession)
      .finally(() => setChecking(false));
    // Si la sesión expira o se cierra en otra pestaña, el panel se cierra aquí.
    return onSessionChange(setSession);
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Comprobando sesión…
      </div>
    );
  }

  if (session) return <>{children(session)}</>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await signIn({ email: email.trim(), password });
    if (result.session) {
      setSession(result.session);
    } else {
      setError(result.error);
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
        <h1 className="text-xl font-bold">{BRAND.name} · panel interno</h1>

        {mode === 'supabase' ? (
          <>
            <input
              className="field"
              type="email"
              autoComplete="username"
              placeholder="Tu correo"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
            />
            <input
              className="field"
              type="password"
              autoComplete="current-password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
            />
            <p className="text-xs text-slate-500">
              Sesión de Supabase. Es la que hace que puedas leer los leads: sin ella, Row Level
              Security solo deja insertar.
            </p>
          </>
        ) : (
          <>
            <input
              className="field"
              type="password"
              autoComplete="current-password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
            />
            <p className="text-xs text-slate-500">
              Modo local: los datos están en este navegador. Esta contraseña es un portero, no
              seguridad.
            </p>
          </>
        )}

        {error && <p className="text-sm font-medium text-alert">{error}</p>}

        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
        <Link to="/" className="block text-center text-sm text-slate-500 underline">
          Volver al inicio
        </Link>
      </form>
    </div>
  );
}
