import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api, getApiError } from '../../utils/api';
import Logo from '../../components/brand/Logo';

export default function Register() {
  const { isDark } = useTheme();
  const navigate   = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);
  const [autoVerified, setAutoVerified] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', {
        name:     form.name.trim(),
        email:    form.email.trim(),
        password: form.password
      });
      setAutoVerified(!!res.data.autoVerified);
      setSuccess(true);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-6">
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {autoVerified ? '¡Cuenta creada!' : '¡Ya casi está!'}
        </h1>
        <p className="text-gray-500 dark:text-zinc-400 mb-6 leading-relaxed">
          {autoVerified
            ? 'Tu cuenta está lista. Ya podés iniciar sesión.'
            : <>Te enviamos un email a <strong className="text-gray-900 dark:text-white">{form.email}</strong>.<br />Hacé click en el link para verificar tu cuenta.</>
          }
        </p>
        <Link to="/login" className="btn-primary px-6 py-3 inline-flex">
          Ir al login
        </Link>
        {!autoVerified && <p className="text-xs text-gray-400 dark:text-zinc-600 mt-4">¿No llegó? Revisá tu carpeta de spam.</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-5">
            <Logo variant="auto" size="lg" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Creá tu cuenta</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
            Empezá a entregar galerías profesionales<br />a tus clientes en minutos.
          </p>
        </div>

        <div className="card shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nombre completo</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input"
                placeholder="Juan Pérez"
                autoComplete="name"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="input"
                placeholder="juan@ejemplo.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  className="input pr-10"
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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

            <button type="submit" disabled={loading || !form.name || !form.email || !form.password} className="btn-primary w-full py-3">
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creando cuenta...
                </span>
              ) : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-zinc-400 mt-6">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-gray-900 dark:text-white font-medium hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
