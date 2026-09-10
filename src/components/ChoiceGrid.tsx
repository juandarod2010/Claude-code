interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: readonly Option<T>[];
  selected: readonly T[];
  onToggle: (value: T) => void;
  /** true = solo se puede elegir una opción. */
  single?: boolean;
}

/** Rejilla de opciones táctil. Móvil primero: objetivo de pulsación grande. */
export default function ChoiceGrid<T extends string>({
  options,
  selected,
  onToggle,
  single = false,
}: Props<T>) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            role={single ? 'radio' : 'checkbox'}
            aria-checked={isSelected}
            onClick={() => onToggle(option.value)}
            className={`min-h-[56px] rounded-lg border px-4 py-3 text-left text-base transition ${
              isSelected
                ? 'border-brand-600 bg-brand-50 font-semibold text-brand-700'
                : 'border-slate-300 bg-white hover:border-slate-400'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
