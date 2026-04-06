import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Eye, EyeOff, CheckCircle2, Ban } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { clientApi, getApiError } from '../../utils/api';
import { GalleryPublicInfo } from '../../types';

export default function GalleryEntry() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [info, setInfo] = useState<GalleryPublicInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [accessing, setAccessing] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    if (!slug) return;

    if (sessionStorage.getItem(`selecta_submitted_${slug}`)) {
      setAlreadySubmitted(true);
      setLoading(false);
      return;
    }

    const storedSlug = sessionStorage.getItem('selecta_gallery_slug');
    const storedToken = sessionStorage.getItem('selecta_gallery_token');
    if (storedSlug === slug && storedToken) {
      navigate(`/g/${slug}/view`, { replace: true });
      return;
    }
    clientApi.get(`/g/${slug}`)
      .then(res => {
        setInfo(res.data);
        if (!res.data.hasPassword && res.data.status === 'active') {
          handleAccess('', res.data);
        }
      })
      .catch(err => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAccess = async (pwd: string, galleryInfo?: GalleryPublicInfo) => {
    const gi = galleryInfo || info;
    if (!gi || !slug) return;
    setAccessing(true);
    setError('');
    try {
      const res = await clientApi.post(`/g/${slug}/access`, { password: pwd });
      sessionStorage.setItem('selecta_gallery_token', res.data.token);
      sessionStorage.setItem('selecta_gallery_slug', slug);
      navigate(`/g/${slug}/view`, { replace: true });
    } catch (err) {
      setError(getApiError(err));
      setAccessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAccess(password);
  };

  if (loading || accessing) return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-zinc-600 border-t-gray-900 dark:border-t-white animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500 dark:text-zinc-400">Cargando...</p>
      </div>
    </div>
  );

  if (alreadySubmitted) return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={30} className="text-emerald-500" strokeWidth={1.5} />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Selección ya enviada</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          Ya enviaste tu selección de fotos para esta galería. El fotógrafo ha recibido tu elección.
        </p>
      </div>
    </div>
  );

  if (info?.selectionMode === 'single' && info?.isFinalized) return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-5">
          <Ban size={28} className="text-gray-400 dark:text-zinc-500" strokeWidth={1.5} />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Galería finalizada</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          La selección de fotos para esta galería ya fue realizada.
        </p>
      </div>
    </div>
  );

  if (error && !info) return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔍</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Galería no encontrada</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400">{error}</p>
      </div>
    </div>
  );

  if (info?.status === 'closed') return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔒</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{info.name}</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400">Esta galería ya no está disponible.</p>
      </div>
    </div>
  );

  if (!info?.hasPassword) return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-zinc-600 border-t-gray-900 dark:border-t-white animate-spin mx-auto" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col">
      <header className="border-b border-gray-100 dark:border-zinc-900">
        <div className="max-w-screen-lg mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-base font-bold tracking-tight">Selecta</span>
          <button onClick={toggleTheme} className="btn-ghost p-2">
            {isDark ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <Lock size={20} className="text-gray-500 dark:text-zinc-400" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{info?.name}</h1>
            {info?.clientName && (
              <p className="text-sm text-gray-500 dark:text-zinc-400">{info.clientName}</p>
            )}
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">
              Introduce la contraseña para ver las fotos
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pr-10 text-center text-lg tracking-widest"
                  placeholder="••••••••"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button type="submit" disabled={accessing || !password} className="btn-primary w-full py-3">
              Ver galería
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
