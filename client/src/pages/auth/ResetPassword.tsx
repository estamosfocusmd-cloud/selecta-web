import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { api, getApiError } from '../../utils/api';
import Logo from '../../components/brand/Logo';

export default function ResetPassword() {
  const [params]   = useSearchParams();
  const token      = params.get('token');
  const navigate   = useNavigate();
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (!token) return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-gray-500 dark:text-zinc-400 mb-4">Link inválido.</p>
        <Link to="/forgot-password" className="btn-primary px-6 py-3 inline-flex">Solicitar nuevo link</Link>
      </div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Contraseña actualizada</h1>
        <p className="text-gray-500 dark:text-zinc-400">Redirigiendo al login...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Link to="/" className="inline-block mb-5">
            <Logo variant="auto" size="md" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Nueva contraseña</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400">Elegí una contraseña segura para tu cuenta.</p>
        </div>

        <div className="card shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  className="input pr-10"
                  placeholder="Mínimo 6 caracteres"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || !password} className="btn-primary w-full py-3">
              {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
