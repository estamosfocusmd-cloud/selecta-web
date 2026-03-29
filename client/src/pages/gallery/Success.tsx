import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Home } from 'lucide-react';

interface SuccessState {
  count: number;
  galleryName: string;
  photoDetails: { id: string; originalName: string }[];
}

export default function Success() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as SuccessState | null;

  if (!state) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500 dark:text-zinc-400 mb-4">No hay información de selección.</p>
          <button onClick={() => navigate('/')} className="btn-secondary">Ir al inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-500" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Selección enviada!
          </h1>
          <p className="text-gray-500 dark:text-zinc-400">
            Has enviado <span className="font-semibold text-gray-900 dark:text-white">{state.count} foto{state.count !== 1 ? 's' : ''}</span>
            {state.galleryName && (
              <> de la galería <span className="font-semibold text-gray-900 dark:text-white">"{state.galleryName}"</span></>
            )}.
          </p>
          <p className="text-sm text-gray-400 dark:text-zinc-500 mt-2">
            El fotógrafo recibirá tu selección y se pondrá en contacto contigo.
          </p>
        </div>

        {state.photoDetails && state.photoDetails.length > 0 && (
          <div className="card text-left mb-8">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Fotos seleccionadas ({state.photoDetails.length})
            </h2>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {state.photoDetails.map((p, i) => (
                <div key={p.id} className="flex items-center gap-2 text-xs">
                  <span className="text-gray-400 dark:text-zinc-600 w-5 text-right shrink-0">{i + 1}.</span>
                  <span className="font-mono text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800 rounded px-2 py-1 flex-1 truncate">
                    {p.originalName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.history.back()}
            className="btn-secondary w-full py-3 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Volver a la galería
          </button>
          <Link to="/" className="btn-ghost w-full py-3 flex items-center justify-center gap-2 text-sm">
            <Home size={14} />
            Ir al inicio
          </Link>
        </div>

        <p className="text-xs text-gray-400 dark:text-zinc-600 mt-8">
          Selecta · Galerías privadas para fotógrafos
        </p>
      </div>
    </div>
  );
}
