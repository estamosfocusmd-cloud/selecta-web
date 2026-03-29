import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import { api, getApiError } from '../../utils/api';

export default function NewGallery() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    clientName: '',
    password: '',
    maxSelections: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/galleries', {
        name: form.name.trim(),
        clientName: form.clientName.trim(),
        password: form.password.trim() || undefined,
        maxSelections: form.maxSelections ? parseInt(form.maxSelections) : 0
      });
      navigate(`/dashboard/gallery/${res.data.id}`);
    } catch (err) {
      setError(getApiError(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Navbar variant="dashboard" />

      <div className="max-w-screen-sm mx-auto px-4 sm:px-6 py-10">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} />
          Volver
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Nueva galería</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-8">Configura los detalles y empieza a subir fotos.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Nombre de la galería *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input"
              placeholder="Ej: Boda Ana y Carlos"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="label">Nombre del cliente</label>
            <input
              name="clientName"
              value={form.clientName}
              onChange={handleChange}
              className="input"
              placeholder="Ej: Ana García"
            />
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1.5">Opcional. Solo visible en tu panel.</p>
          </div>

          <div>
            <label className="label">Contraseña de acceso</label>
            <input
              name="password"
              type="text"
              value={form.password}
              onChange={handleChange}
              className="input"
              placeholder="Dejar en blanco para acceso libre"
              autoComplete="off"
            />
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1.5">Si la dejas vacía, cualquier persona con el enlace podrá acceder.</p>
          </div>

          <div>
            <label className="label">Máximo de fotos a seleccionar</label>
            <input
              name="maxSelections"
              type="number"
              min="0"
              value={form.maxSelections}
              onChange={handleChange}
              className="input"
              placeholder="0 = sin límite"
            />
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1.5">El cliente verá un aviso si supera el límite. 0 = sin restricción.</p>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Link to="/dashboard" className="btn-secondary flex-1 justify-center py-3">
              Cancelar
            </Link>
            <button type="submit" disabled={loading || !form.name.trim()} className="btn-primary flex-1 py-3">
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creando...
                </span>
              ) : 'Crear galería'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
