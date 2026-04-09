import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ImageIcon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { clientApi, getApiError } from '../../utils/api';
import { DeliveryInfo } from '../../types';

export default function DeliveryEntry() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [info, setInfo] = useState<DeliveryInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await clientApi.get(`/g/${slug}/delivery`);
        const data: DeliveryInfo = res.data;
        setInfo(data);
        if (!data.hasDeliveryPassword) {
          navigate(`/g/${slug}/entrega/view`, { replace: true });
        }
      } catch (err) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, navigate]);

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await clientApi.post(`/g/${slug}/delivery/access`, { password });
      sessionStorage.setItem(`selecta_delivery_auth_${slug}`, '1');
      navigate(`/g/${slug}/entrega/view`, { replace: true });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'}`}>
      <div className="w-8 h-8 border-2 border-gray-300 dark:border-zinc-600 border-t-gray-900 dark:border-t-white rounded-full animate-spin" />
    </div>
  );

  if (error && !info) return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'}`}>
      <div className="text-center max-w-sm">
        <p className="text-gray-500 dark:text-zinc-400">{error}</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'}`}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gray-900 dark:bg-white flex items-center justify-center mx-auto mb-5">
            <ImageIcon size={28} className="text-white dark:text-gray-900" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{info?.name}</h1>
          {info?.clientName && (
            <p className="text-sm text-gray-500 dark:text-zinc-400">Para {info.clientName}</p>
          )}
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{info?.photoCount} fotos</p>
        </div>

        <form onSubmit={handleAccess} className="space-y-4">
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              className="input pl-10 pr-10"
              placeholder="Contraseña de acceso"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={submitting || !password.trim()} className="btn-primary w-full py-3">
            {submitting ? 'Verificando...' : 'Ver fotos'}
          </button>
        </form>
      </div>
    </div>
  );
}
