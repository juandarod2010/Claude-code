import { NavLink } from 'react-router-dom';
import AdminGate from './AdminGate';
import { BRAND } from '../config/brand';
import { storage } from '../lib/storage';

const LINKS = [
  { to: '/admin/leads', label: 'Leads' },
  { to: '/admin/rules-status', label: 'Estado de reglas' },
  { to: '/admin/fill-rules', label: 'Rellenar reglas' },
  { to: '/prospeccion', label: 'Prospección' },
];

/** Marco común de las pantallas internas: portero + navegación. */
export default function AdminLayout({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <AdminGate>
      <div className="min-h-screen">
        <header className="border-b border-slate-200 bg-slate-50 px-5 py-3">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2">
            <span className="text-sm font-bold">{BRAND.name}</span>
            <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    isActive
                      ? 'font-semibold text-brand-700 underline'
                      : 'text-slate-600 hover:text-ink'
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <span className="ml-auto rounded bg-white px-2 py-1 text-xs text-slate-500">
              almacenamiento: {storage.mode}
            </span>
          </div>
        </header>

        <main className="px-5 py-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-bold">{title}</h1>
              {actions}
            </div>
            <div className="mt-6">{children}</div>
          </div>
        </main>
      </div>
    </AdminGate>
  );
}
