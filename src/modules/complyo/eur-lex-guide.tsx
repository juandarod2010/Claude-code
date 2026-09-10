import { useEffect, useMemo, useState } from 'react';
import { COUNTRIES, COUNTRY_LABELS, WASTE_STREAMS, WASTE_STREAM_LABELS } from '../../types/domain';

/**
 * Guía interactiva para llegar a la fuente oficial de cada país.
 *
 * No te dice QUÉ dice la norma: te dice DÓNDE mirar y en qué orden. El
 * contenido regulatorio lo lees tú en la fuente. El checklist se guarda en el
 * navegador para poder retomarlo.
 *
 * No hay capturas de pantalla: EUR-Lex y los portales nacionales cambian de
 * aspecto, y una captura desactualizada estorba más que ayuda. Ver DECISIONS.md.
 */

const STORAGE_KEY = 'complyo.eurlex-checklist';

export const EUR_LEX_URL = 'https://eur-lex.europa.eu/homepage.html?locale=es';
export const YOUR_EUROPE_URL = 'https://europa.eu/youreurope/business/index_es.htm';

interface Step {
  id: string;
  title: string;
  body: string[];
  link?: { label: string; href: string };
}

const STEPS: Step[] = [
  {
    id: 'paso-1',
    title: '1. Lee la norma europea en su idioma oficial',
    body: [
      'Entra en EUR-Lex y busca el Reglamento (UE) 2025/40. Cambia el idioma a español en la esquina superior: las traducciones oficiales tienen el mismo valor legal.',
      'Quédate con dos cosas: qué obliga directamente el Reglamento y qué deja en manos de cada Estado miembro. Todo lo segundo hay que buscarlo país por país.',
      'Copia el enlace permanente (el que contiene "CELEX"): ese es el que va en el campo de fuente.',
    ],
    link: { label: 'Abrir EUR-Lex', href: EUR_LEX_URL },
  },
  {
    id: 'paso-2',
    title: '2. Localiza la directiva de base del flujo de residuo',
    body: [
      'Cada flujo tiene su propia norma europea: envases, residuos de aparatos eléctricos y electrónicos, y pilas y acumuladores.',
      'Busca cada una en EUR-Lex por su materia y anota el número. La ficha de EUR-Lex incluye un apartado de medidas nacionales de ejecución: ahí es donde aparece la transposición de cada país.',
      'Ese apartado es el atajo: te lleva directo a la norma nacional sin tener que adivinar cómo se llama.',
    ],
    link: { label: 'Abrir EUR-Lex', href: EUR_LEX_URL },
  },
  {
    id: 'paso-3',
    title: '3. Salta al portal de la administración nacional',
    body: [
      'El portal Tu Europa de la Comisión enlaza, por país y por materia, a la administración competente. Úsalo como índice en vez de buscar a ciegas.',
      'Confirma que has llegado a un dominio de administración pública. Si acabas en la web de una consultora o de un gestor privado, retrocede: esa no es la fuente.',
    ],
    link: { label: 'Abrir Tu Europa', href: YOUR_EUROPE_URL },
  },
  {
    id: 'paso-4',
    title: '4. Encuentra el registro concreto y anota su nombre literal',
    body: [
      'Busca el registro de productores del flujo que estés verificando. Copia el nombre tal y como aparece, en el idioma original, sin traducirlo.',
      'Anota también el organismo de responsabilidad ampliada si el país lo separa del registro público: son dos trámites distintos.',
      'Guarda el enlace profundo a la página del registro, no la portada del ministerio.',
    ],
  },
  {
    id: 'paso-5',
    title: '5. Extrae los cuatro datos que pide el formulario',
    body: [
      '¿Es obligatorio designar representante autorizado si el vendedor no está establecido en la Unión Europea?',
      '¿Con qué periodicidad hay que declarar las cantidades?',
      '¿Qué datos exige el alta o la declaración? Uno por línea, literales.',
      '¿Qué consecuencia documenta la fuente si no se cumple? Sin importes salvo que la fuente los diga.',
    ],
  },
  {
    id: 'paso-6',
    title: '6. Guarda con fecha y marca como verificada',
    body: [
      'Pon en la fecha de verificación el día en que has leído la fuente, no la fecha de la norma.',
      'Marca "verificada" solo si has leído tú la página que has enlazado. Es tu firma.',
      'Si algo no lo has encontrado, guárdalo sin verificar: el informe lo tapará con la etiqueta de pendiente y no llegará a un cliente por accidente.',
    ],
  },
];

function readChecklist(): Record<string, boolean> {
  if (typeof localStorage === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, boolean>;
  } catch {
    return {};
  }
}

/** Casillas por país y flujo: 18 combinaciones. */
function comboKey(country: string, stream: string): string {
  return `${country}:${stream}`;
}

export default function EurLexGuide() {
  const [checked, setChecked] = useState<Record<string, boolean>>(readChecklist);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch {
      // Sin almacenamiento, la guía sigue funcionando: solo no recuerda.
    }
  }, [checked]);

  const toggle = (key: string) => setChecked((c) => ({ ...c, [key]: !c[key] }));

  const done = useMemo(
    () =>
      COUNTRIES.flatMap((c) => WASTE_STREAMS.map((s) => comboKey(c, s))).filter((k) => checked[k])
        .length,
    [checked],
  );

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold">Cómo llegar a la fuente oficial</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Esta guía no te dice qué dice la norma: te dice dónde mirar y en qué orden. El contenido
          lo lees tú en la fuente y lo copias literal. Si en algún paso te descubres pensando «esto
          seguro que es así», ese es el momento de dejarlo sin verificar.
        </p>
      </section>

      <ol className="space-y-4">
        {STEPS.map((step) => (
          <li key={step.id} className="card">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0"
                checked={Boolean(checked[step.id])}
                onChange={() => toggle(step.id)}
              />
              <div>
                <h3 className="font-semibold">{step.title}</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {step.body.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                {step.link && (
                  <a
                    className="mt-3 inline-block text-sm font-medium text-brand-600 underline"
                    href={step.link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {step.link.label} ↗
                  </a>
                )}
              </div>
            </label>
          </li>
        ))}
      </ol>

      <section>
        <h2 className="text-xl font-bold">
          Seguimiento por país y flujo{' '}
          <span className="text-base font-normal text-slate-500">
            ({done} de {COUNTRIES.length * WASTE_STREAMS.length} fuentes localizadas)
          </span>
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Marca aquí cuando hayas <em>encontrado</em> la fuente oficial. Que esté guardada y
          verificada se ve en el panel de estado de reglas.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-300 text-left text-slate-500">
                <th className="py-2 pr-3 font-semibold">País</th>
                {WASTE_STREAMS.map((s) => (
                  <th key={s} className="py-2 pr-3 font-semibold">
                    {WASTE_STREAM_LABELS[s]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COUNTRIES.map((country) => (
                <tr key={country} className="border-b border-slate-200">
                  <td className="py-2 pr-3 font-medium">{COUNTRY_LABELS[country]}</td>
                  {WASTE_STREAMS.map((stream) => {
                    const key = comboKey(country, stream);
                    return (
                      <td key={stream} className="py-2 pr-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={Boolean(checked[key])}
                            onChange={() => toggle(key)}
                            aria-label={`${COUNTRY_LABELS[country]} — ${WASTE_STREAM_LABELS[stream]}`}
                          />
                          <span className="text-xs text-slate-500">
                            {checked[key] ? 'encontrada' : 'pendiente'}
                          </span>
                        </label>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
