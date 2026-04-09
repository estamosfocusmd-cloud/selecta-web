import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api, getApiError } from '../../utils/api';
import Logo from '../../components/brand/Logo';

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (sent) return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center mx-auto mb-6">
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Revisá tu email</h1>
        <p className="text-gray-500 dark:text-zinc-400 mb-6 leading-relaxed">
          Si existe una cuenta con <strong className="text-gray-900 dark:text-white">{email}</strong>, vas a recibir un link para restablecer tu contraseña en los próximos minutos.
        </p>
        <Link to="/login" className="btn-secondary px-6 py-3 inline-flex">
          <ArrowLeft size={16} />
          Volver al login
        </Link>
        <p className="text-xs text-gray-400 dark:text-zinc-600 mt-4">¿No llegó? Revisá tu carpeta de spam.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} />
          Volver al login
        </Link>

        <div className="mb-8">
          <Link to="/" className="inline-block mb-5">
            <Logo variant="auto" size="md" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Olvidé mi contraseña</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Ingresá tu email y te enviamos un link para crear una nueva contraseña.
          </p>
        </div>

        <div className="card shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                className="input"
                placeholder="tu@email.com"
                autoFocus
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || !email.trim()} className="btn-primary w-full py-3">
              {loading ? 'Enviando...' : 'Enviar link de recuperación'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
