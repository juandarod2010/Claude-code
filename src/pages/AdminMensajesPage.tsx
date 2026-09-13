import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { ENTRY_OFFER } from '../config/brand';
import { analyzeSuspensionEmail } from '../modules/appeals/analyzer';
import {
  OBJECTIONS,
  sequence,
  type EntryMessage,
} from '../modules/appeals/entryMessages';
import { isSuspensionType, type SuspensionType } from '../modules/appeals/poa-template';

/**
 * Mensajes de la oferta de entrada, listos para copiar.
 *
 * Existe porque unas plantillas que no se pueden copiar en dos segundos no se
 * usan: acabas escribiendo a mano, cada mensaje sale distinto y las métricas
 * dejan de comparar nada.
 *
 * El gancho se elige solo a partir del texto del prospecto: pegas lo que ha
 * escrito, el analizador clasifica el caso y el mensaje sale ya apuntado a su
 * tipo de suspensión. Es el paso que convierte una plantilla en un mensaje que
 * parece escrito para esa persona.
 */
export default function AdminMensajesPage() {
  const [name, setName] = useState('');
  const [quote, setQuote] = useState('');
  const [planRejected, setPlanRejected] = useState(false);
  const [manualType, setManualType] = useState('');

  // El tipo sale del texto pegado, salvo que se fuerce a mano.
  const detected: SuspensionType | undefined =
    manualType && isSuspensionType(manualType)
      ? manualType
      : quote.trim().length >= 20
        ? analyzeSuspensionEmail(quote).type
        : undefined;

  const input = { name, quote, suspensionType: detected, planRejected };
  const ready = quote.trim().length >= 20;

  return (
    <AdminLayout title="Mensajes">
      <p className="max-w-3xl text-sm text-slate-600">
        Para la oferta de entrada ({ENTRY_OFFER.name}, {ENTRY_OFFER.price.label}). Pega lo que ha
        escrito el prospecto <strong>en público</strong> y el mensaje se arma solo. Si no puedes
        pegar nada suyo, no es un prospecto: no le escribas.
      </p>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-600">Nombre o alias (opcional)</span>
          <input
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Marta"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-600">
            Forzar tipo de suspensión (opcional)
          </span>
          <input
            className="field"
            value={manualType}
            onChange={(e) => setManualType(e.target.value)}
            placeholder="inauthentic, policy_violation…"
          />
        </label>
      </section>

      <label className="mt-4 block text-sm">
        <span className="mb-1 block font-medium text-slate-600">
          Lo que ha escrito él, en sus palabras
        </span>
        <textarea
          className="field"
          rows={5}
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder="Pega su mensaje del foro, del grupo o del hilo."
        />
      </label>

      <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={planRejected}
          onChange={(e) => setPlanRejected(e.target.checked)}
        />
        Ya le han rechazado algún plan
      </label>

      {!ready ? (
        <p className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-slate-700">
          Pega al menos 20 caracteres de lo que ha escrito. Sin eso, el mensaje sale genérico y un
          mensaje genérico no lo contesta nadie.
        </p>
      ) : (
        <p className="mt-6 text-sm text-slate-600">
          Caso clasificado como <strong>{detected ?? 'sin clasificar'}</strong>. El gancho del
          mensaje ya va apuntado a ese tipo.
        </p>
      )}

      <section className="mt-6 space-y-4">
        <h2 className="text-lg font-semibold">Secuencia</h2>
        {sequence(input).map((m) => (
          <MessageCard key={m.id} message={m} />
        ))}
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold">Respuestas a objeciones</h2>
        <p className="text-sm text-slate-600">
          Estas no dependen del prospecto: se copian tal cual. Ninguna intenta darle la vuelta a un
          «no».
        </p>
        {OBJECTIONS.map((m) => (
          <MessageCard key={m.id} message={m} />
        ))}
      </section>
    </AdminLayout>
  );
}

function MessageCard({ message }: { message: EntryMessage }) {
  const [copied, setCopied] = useState(false);

  const full = message.subject
    ? `Asunto: ${message.subject}\n\n${message.body}`
    : message.body;

  return (
    <article className="rounded-lg border border-slate-300 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold">{message.label}</h3>
          <p className="mt-1 text-xs text-slate-500">{message.when}</p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-lg border border-slate-300 px-3 py-1 text-sm"
          onClick={() => {
            navigator.clipboard
              .writeText(full)
              .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              })
              .catch(() => setCopied(false));
          }}
        >
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      {message.subject && (
        <p className="mt-3 text-sm">
          <span className="text-slate-500">Asunto:</span> <strong>{message.subject}</strong>
        </p>
      )}
      <pre className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">
        {message.body}
      </pre>
    </article>
  );
}
