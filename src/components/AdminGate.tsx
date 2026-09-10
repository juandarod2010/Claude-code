import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { adminPassword } from '../lib/adminAuth';
import { BRAND } from '../config/brand';

const SESSION_KEY = 'complyo.admin';

/** Portero de las pantallas internas. Ver src/lib/adminAuth.ts. */

export default function AdminGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(
    () => typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === '1',
  );
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  if (unlocked) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <form
        className="w-full max-w-sm space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (value === adminPassword()) {
            sessionStorage.setItem(SESSION_KEY, '1');
            setUnlocked(true);
          } else {
            setError(true);
          }
        }}
      >
        <h1 className="text-xl font-bold">{BRAND.name} · panel interno</h1>
        <input
          className="field"
          type="password"
          autoComplete="current-password"
          placeholder="Contraseña"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
        />
        {error && <p className="text-sm font-medium text-alert">Contraseña incorrecta.</p>}
        <button type="submit" className="btn-primary w-full">
          Entrar
        </button>
        <Link to="/" className="block text-center text-sm text-slate-500 underline">
          Volver al inicio
        </Link>
      </form>
    </div>
  );
}
