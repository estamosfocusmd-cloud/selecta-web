import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Moon, Sun, X, Ban } from 'lucide-react';
import PhotoCard from '../../components/gallery/PhotoCard';
import Lightbox from '../../components/gallery/Lightbox';
import SelectionBar from '../../components/gallery/SelectionBar';
import { clientApi, getApiError } from '../../utils/api';
import { Photo, GalleryPublicInfo } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

export default function GalleryView() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [info, setInfo] = useState<GalleryPublicInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [galleryClosed, setGalleryClosed] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [clientName, setClientName] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!slug) return;
    const storedSlug = sessionStorage.getItem('selecta_gallery_slug');
    const token = sessionStorage.getItem('selecta_gallery_token');
    if (storedSlug !== slug || !token) {
      navigate(`/g/${slug}`, { replace: true });
      return;
    }
    Promise.all([
      clientApi.get(`/g/${slug}`),
      clientApi.get(`/g/${slug}/photos`)
    ])
      .then(([infoRes, photosRes]) => {
        setInfo(infoRes.data);
        setPhotos(photosRes.data);
      })
      .catch(err => {
        const msg = getApiError(err);
        if (msg.includes('inválido') || msg.includes('expirado')) {
          sessionStorage.removeItem('selecta_gallery_token');
          sessionStorage.removeItem('selecta_gallery_slug');
          navigate(`/g/${slug}`, { replace: true });
        } else if (msg.includes('disponible')) {
          setGalleryClosed(true);
        } else {
          setError(msg);
        }
      })
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSubmit = async () => {
    if (!slug || selected.size === 0) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await clientApi.post(`/g/${slug}/selection`, {
        selectedPhotos: Array.from(selected),
        clientName: clientName.trim() || 'Cliente',
        note: note.trim()
      });
      sessionStorage.removeItem('selecta_gallery_token');
      sessionStorage.removeItem('selecta_gallery_slug');
      sessionStorage.setItem(`selecta_submitted_${slug}`, 'true');
      navigate(`/g/${slug}/success`, {
        state: {
          count: selected.size,
          galleryName: info?.name,
          photoDetails: Array.from(selected).map(id => {
            const p = photos.find(ph => ph.id === id);
            return p ? { id: p.id, originalName: p.originalName } : null;
          }).filter(Boolean)
        }
      });
    } catch (err) {
      setSubmitError(getApiError(err));
      setSubmitting(false);
    }
  };

  const overLimit = info?.maxSelections && info.maxSelections > 0 ? selected.size > info.maxSelections : false;

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-zinc-600 border-t-gray-900 dark:border-t-white animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500 dark:text-zinc-400">Cargando galería...</p>
      </div>
    </div>
  );

  if (galleryClosed) return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-5">
          <Ban size={28} className="text-gray-400 dark:text-zinc-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Galería cerrada</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          Esta galería ya no está disponible para selección.
        </p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => navigate(`/g/${slug}`)} className="btn-secondary">
          Volver
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white shrink-0">Selecta</span>
            {info?.name && (
              <>
                <span className="text-gray-300 dark:text-zinc-700">/</span>
                <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{info.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {info?.maxSelections && info.maxSelections > 0 && selected.size > 0 && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${overLimit ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-300'}`}>
                {selected.size}/{info.maxSelections}
              </span>
            )}
            <button onClick={toggleTheme} className="btn-ghost p-2">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      {photos.length === 0 ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-400 dark:text-zinc-500 text-sm">Esta galería no tiene fotos aún</p>
        </div>
      ) : (
        <>
          <div className="max-w-screen-xl mx-auto px-1.5 sm:px-4 py-3">
            <div className="mb-3 px-2">
              <p className="text-xs text-gray-400 dark:text-zinc-500">
                {photos.length} foto{photos.length !== 1 ? 's' : ''} · Toca para seleccionar · <span className="hidden sm:inline">Doble click o </span>icono <span className="inline-flex items-center gap-0.5">🔍</span> para ampliar
              </p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1 sm:gap-2 pb-32">
              {photos.map((photo, index) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  isSelected={selected.has(photo.id)}
                  onSelect={toggleSelect}
                  onOpenLightbox={setLightboxIndex}
                  index={index}
                />
              ))}
            </div>
          </div>

          <SelectionBar
            count={selected.size}
            maxSelections={info?.maxSelections ?? 0}
            onSubmit={() => setShowConfirm(true)}
            onClear={() => setSelected(new Set())}
            disabled={submitting || !!overLimit}
          />
        </>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          selectedIds={selected}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          onToggleSelect={toggleSelect}
        />
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 sm:p-7 animate-slide-up shadow-2xl">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Enviar selección</h2>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
                  {selected.size} foto{selected.size !== 1 ? 's' : ''} seleccionada{selected.size !== 1 ? 's' : ''}
                </p>
              </div>
              <button onClick={() => setShowConfirm(false)} className="btn-ghost p-1.5">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="label">Tu nombre (opcional)</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="input"
                  placeholder="Ej: Ana García"
                />
              </div>
              <div>
                <label className="label">Nota para el fotógrafo (opcional)</label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="input resize-none"
                  rows={3}
                  placeholder="Cualquier comentario adicional..."
                />
              </div>
            </div>

            {submitError && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 mb-4">
                {submitError}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1 py-3">
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary flex-1 py-3"
              >
                {submitting ? (
                  <span className="flex items-center gap-2 justify-center">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Enviando...
                  </span>
                ) : 'Confirmar y enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
