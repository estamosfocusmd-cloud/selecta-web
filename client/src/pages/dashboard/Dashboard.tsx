import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Image, Clock, CheckCircle2, ExternalLink, Trash2, Copy, Check, UserCircle } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { api, getApiError } from '../../utils/api';
import { Gallery } from '../../types';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="btn-ghost p-1.5 text-xs" title="Copiar enlace">
      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
    </button>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/galleries')
      .then(res => setGalleries(res.data))
      .catch(err => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la galería "${name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/galleries/${id}`);
      setGalleries(gs => gs.filter(g => g.id !== id));
    } catch (err) {
      alert(getApiError(err));
    }
  };

  const getGalleryUrl = (slug: string) => `${window.location.origin}/g/${slug}`;

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const displayName = user?.brandName || user?.name || 'Fotógrafo';
  const firstName   = displayName.split(' ')[0];
  const initials    = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Navbar variant="dashboard" />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">

        {/* Bienvenida personalizada */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard/profile" className="shrink-0">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Perfil" className="w-12 h-12 rounded-xl object-cover hover:opacity-90 transition-opacity" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-zinc-800 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors">
                  <span className="text-base font-bold text-gray-500 dark:text-zinc-400">{initials}</span>
                </div>
              )}
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Hola, {firstName} 👋
              </h1>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
                {galleries.length === 0 ? 'Sin galerías aún' : `${galleries.length} galería${galleries.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/dashboard/profile" className="btn-secondary hidden sm:inline-flex items-center gap-1.5 text-sm px-3 py-2">
              <UserCircle size={15} />
              Perfil
            </Link>
            <Link to="/dashboard/gallery/new" className="btn-primary">
              <Plus size={16} />
              <span className="hidden sm:inline">Nueva galería</span>
            </Link>
          </div>
        </div>

        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-100 dark:bg-zinc-800 rounded w-1/2 mb-5" />
                <div className="flex gap-3">
                  <div className="h-3 bg-gray-100 dark:bg-zinc-800 rounded w-16" />
                  <div className="h-3 bg-gray-100 dark:bg-zinc-800 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {!loading && !error && galleries.length === 0 && (
          <div className="text-center py-24">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-5">
              <Image size={24} className="text-gray-400 dark:text-zinc-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Aún no tienes galerías</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">Crea tu primera galería y compártela con tu cliente.</p>
            <Link to="/dashboard/gallery/new" className="btn-primary">
              <Plus size={16} />
              Crear galería
            </Link>
          </div>
        )}

        {!loading && galleries.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleries.map(gallery => (
              <div key={gallery.id} className="card group hover:border-gray-300 dark:hover:border-zinc-600 transition-colors relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{gallery.name}</h3>
                    {gallery.clientName && (
                      <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{gallery.clientName}</p>
                    )}
                  </div>
                  <span className={`shrink-0 ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                    gallery.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}>
                    {gallery.status === 'active' ? 'Activa' : 'Cerrada'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-zinc-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Image size={12} />
                    {gallery.photos?.length ?? 0} fotos
                  </span>
                  {gallery.maxSelections > 0 && (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Máx. {gallery.maxSelections}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDate(gallery.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-1 pt-3 border-t border-gray-100 dark:border-zinc-800">
                  <div className="flex items-center gap-1 flex-1 min-w-0 text-xs text-gray-400 dark:text-zinc-500 bg-gray-50 dark:bg-zinc-800/50 rounded-lg px-2 py-1.5">
                    <span className="truncate">{getGalleryUrl(gallery.slug)}</span>
                    <CopyButton text={getGalleryUrl(gallery.slug)} />
                  </div>
                  <Link
                    to={`/g/${gallery.slug}`}
                    target="_blank"
                    className="btn-ghost p-1.5"
                    title="Ver galería"
                  >
                    <ExternalLink size={13} />
                  </Link>
                  <Link to={`/dashboard/gallery/${gallery.id}`} className="btn-primary text-xs px-3 py-1.5">
                    Gestionar
                  </Link>
                  <button
                    onClick={() => handleDelete(gallery.id, gallery.name)}
                    className="btn-ghost p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                    title="Eliminar"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
