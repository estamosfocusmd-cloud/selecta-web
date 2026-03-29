import { Send, X } from 'lucide-react';

interface SelectionBarProps {
  count: number;
  maxSelections: number;
  onSubmit: () => void;
  onClear: () => void;
  disabled?: boolean;
}

export default function SelectionBar({ count, maxSelections, onSubmit, onClear, disabled }: SelectionBarProps) {
  const overLimit = maxSelections > 0 && count > maxSelections;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-30 transition-all duration-300 ease-out ${count > 0 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
      <div className="border-t border-gray-200 dark:border-zinc-800 bg-white/97 dark:bg-zinc-950/97 backdrop-blur-xl pb-safe">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-3">

          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${overLimit ? 'bg-red-500' : 'bg-gray-900 dark:bg-white dark:text-gray-900'}`}>
              {count}
            </div>
            <div className="min-w-0">
              <p className={`text-sm font-medium leading-tight ${overLimit ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'}`}>
                {count === 1 ? '1 foto seleccionada' : `${count} fotos seleccionadas`}
              </p>
              {maxSelections > 0 && (
                <p className={`text-xs leading-tight mt-0.5 ${overLimit ? 'text-red-400' : 'text-gray-400 dark:text-zinc-500'}`}>
                  {overLimit ? `Máximo: ${maxSelections}` : `de ${maxSelections} permitidas`}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClear}
              className="w-11 h-11 sm:h-10 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-500 dark:text-gray-400 flex items-center justify-center active:scale-95 transition-transform"
              title="Limpiar selección"
            >
              <X size={16} />
            </button>
            <button
              onClick={onSubmit}
              disabled={disabled || count === 0 || overLimit}
              className="btn-primary h-11 sm:h-10 px-4 sm:px-5 text-sm"
            >
              <Send size={15} />
              <span>Enviar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
