import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Download, FolderDown, ImageIcon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { clientApi, getApiError } from '../../utils/api';
import { DeliveryInfo, Photo } from '../../types';

const BASE = (import.meta.env.VITE_API_URL as string) || '';

function downloadFile(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function DeliveryView() {
  const { slug } = useParams<{ slug: string }>();
  const { theme } = useTheme();
  const [info, setInfo] = useState<DeliveryInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await clientApi.get(`/${slug}/delivery`);
        setInfo(res.data);
      } catch (err) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const photos: Photo[] = info?.photos || [];

  const prev = useCallback(() => setLightbox(i => i !== null ? (i - 1 + photos.length) % photos.length : null), [photos.length]);
  const next = useCallback(() => setLightbox(i => i !== null ? (i + 1) % photos.length : null), [photos.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, prev, next]);

  const handleDownloadAll = async () => {
    if (!slug || downloading) return;
    setDownloading(true);
    try {
      const url = `${BASE}/api/g/${slug}/delivery/zip`;
      const a = document.createElement('a');
      a.href = url;
      a.download = `${info?.name || 'entrega'}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setTimeout(() => setDownloading(false), 2000);
    }
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'}`}>
      <div className="w-8 h-8 border-2 border-gray-300 dark:border-zinc-600 border-t-gray-900 dark:border-t-white rounded-full animate-spin" />
    </div>
  );

  if (error || !info) return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'}`}>
      <p className="text-gray-500 dark:text-zinc-400">{error || 'Galería no encontrada'}</p>
    </div>
  );

  if (photos.length === 0) return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'}`}>
      <div className="text-center">
        <ImageIcon size={40} className="text-gray-300 dark:text-zinc-700 mx-auto mb-3" strokeWidth={1} />
        <p className="text-gray-500 dark:text-zinc-400">Aún no hay fotos en esta entrega.</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-900">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-gray-900 dark:text-white truncate">{info.name}</h1>
            <p className="text-xs text-gray-400 dark:text-zinc-500">{photos.length} foto{photos.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={handleDownloadAll}
            disabled={downloading}
            className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium px-4 py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
          >
            <FolderDown size={16} />
            {downloading ? 'Preparando...' : 'Descargar todo'}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 cursor-pointer"
              onClick={() => setLightbox(i)}
            >
              <img
                src={photo.url}
                alt={photo.originalName}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <button
                onClick={e => {
                  e.stopPropagation();
                  downloadFile(photo.url, photo.originalName);
                }}
                className="absolute bottom-2 right-2 p-2 rounded-lg bg-white/90 dark:bg-zinc-900/90 text-gray-700 dark:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-zinc-800"
                title="Descargar"
              >
                <Download size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={e => { e.stopPropagation(); setLightbox(null); }}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          {photos.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev(); }}
                className="absolute left-3 sm:left-6 p-2 sm:p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); next(); }}
                className="absolute right-3 sm:right-6 p-2 sm:p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <div className="relative max-w-[90vw] max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <img
              src={photos[lightbox].url}
              alt={photos[lightbox].originalName}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-4 py-3 bg-gradient-to-t from-black/60 to-transparent rounded-b-lg">
              <span className="text-sm text-white/80 truncate max-w-[70%]">{photos[lightbox].originalName}</span>
              <button
                onClick={() => downloadFile(photos[lightbox].url, photos[lightbox].originalName)}
                className="flex items-center gap-1.5 text-sm text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Download size={14} />
                Descargar
              </button>
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
            {lightbox + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  );
}
