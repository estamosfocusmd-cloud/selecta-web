import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Download, FolderDown, ImageIcon, Grid3X3, AlignJustify, ChevronDown } from 'lucide-react';
import { clientApi, getApiError } from '../../utils/api';
import { DeliveryInfo, Photo } from '../../types';

const BASE = (import.meta.env.VITE_API_URL as string) || '';

function downloadFile(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  a.target = '_blank'; a.rel = 'noopener noreferrer';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

// ─── Lightbox ────────────────────────────────────────────────────────────────
function DeliveryLightbox({ photos, index, onClose, onNav, accent }: {
  photos: Photo[]; index: number; accent: string;
  onClose: () => void; onNav: (i: number) => void;
}) {
  const photo = photos[index];
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const isSwiping = useRef<boolean | null>(null);
  const indexRef = useRef(index);
  indexRef.current = index;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && index > 0) onNav(index - 1);
      if (e.key === 'ArrowRight' && index < photos.length - 1) onNav(index + 1);
    };
    document.addEventListener('keydown', handler);
    // iOS Safari fix
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top      = `-${scrollY}px`;
    document.body.style.width    = '100%';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.position = '';
      document.body.style.top      = '';
      document.body.style.width    = '';
      window.scrollTo(0, scrollY);
    };
  }, [index, photos.length, onClose, onNav]);

  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const onStart = (e: TouchEvent) => { touchStartX.current = e.touches[0].clientX; isSwiping.current = null; };
    const onMove  = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - touchStartX.current;
      if (isSwiping.current === null && Math.abs(dx) > 8) isSwiping.current = true;
      if (isSwiping.current) e.preventDefault();
    };
    const onEnd   = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      if (isSwiping.current && Math.abs(dx) > 50) {
        if (dx > 0 && indexRef.current > 0) onNav(indexRef.current - 1);
        else if (dx < 0 && indexRef.current < photos.length - 1) onNav(indexRef.current + 1);
      } else if (Math.abs(dx) < 10) onClose();
      isSwiping.current = null;
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd, { passive: true });
    return () => { el.removeEventListener('touchstart', onStart); el.removeEventListener('touchmove', onMove); el.removeEventListener('touchend', onEnd); };
  }, [photos.length, onNav, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/96 flex items-center justify-center animate-fade-in">
      <div ref={containerRef} className="w-full h-full flex items-center justify-center" style={{ touchAction: 'none' }}>
        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"><X size={18} /></button>
        <span className="absolute top-4 left-4 text-white/40 text-xs bg-black/20 rounded-full px-3 py-1">{index + 1} / {photos.length}</span>
        {index > 0 && (
          <button onClick={() => onNav(index - 1)} className="absolute left-3 z-20 w-11 h-11 rounded-full bg-white/10 text-white hidden sm:flex items-center justify-center hover:bg-white/20"><ChevronLeft size={22} /></button>
        )}
        {index < photos.length - 1 && (
          <button onClick={() => onNav(index + 1)} className="absolute right-3 z-20 w-11 h-11 rounded-full bg-white/10 text-white hidden sm:flex items-center justify-center hover:bg-white/20"><ChevronRight size={22} /></button>
        )}
        <img key={photo.id} src={photo.url} alt={photo.originalName} className="max-w-full max-h-full object-contain px-4 sm:px-16" draggable={false} decoding="async" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <button
            onClick={() => downloadFile(photo.url, photo.originalName)}
            className="flex items-center gap-2 text-sm text-white px-4 py-2 rounded-xl transition-colors"
            style={{ background: accent }}
          >
            <Download size={14} /> Descargar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DeliveryView() {
  const { slug } = useParams<{ slug: string }>();
  const [info, setInfo] = useState<DeliveryInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [view, setView] = useState<'grid' | 'scroll'>('grid');
  const [coverVisible, setCoverVisible] = useState(true);

  useEffect(() => {
    clientApi.get(`/g/${slug}/delivery`)
      .then(r => { setInfo(r.data); setView(r.data.viewMode || 'grid'); })
      .catch(e => setError(getApiError(e)))
      .finally(() => setLoading(false));
  }, [slug]);

  const nav = useCallback((i: number) => setLightbox(i), []);

  const handleDownloadAll = async () => {
    if (!slug || downloading) return;
    setDownloading(true);
    const a = document.createElement('a');
    a.href = `${BASE}/api/g/${slug}/delivery/zip`;
    a.download = `${info?.name || 'entrega'}.zip`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => setDownloading(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (error || !info) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <p className="text-zinc-400">{error || 'Galería no encontrada'}</p>
    </div>
  );

  const photos: Photo[] = info.photos || [];
  const accent = info.accentColor || '#00C2A8';
  const bgColor = info.bgColor || 'white';
  const bgStyle = bgColor === 'white' ? '#ffffff'
    : bgColor === 'black' ? '#0a0a0a'
    : bgColor;
  const isDarkBg = bgColor === 'black' || bgColor.startsWith('#0') || bgColor.startsWith('#1') || bgColor.startsWith('#2');
  const textColor = isDarkBg ? '#ffffff' : '#111827';
  const textMuted = isDarkBg ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';

  if (photos.length === 0) return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: bgStyle }}>
      <div className="text-center">
        <ImageIcon size={40} className="mx-auto mb-3 opacity-30" />
        <p style={{ color: textMuted }}>Aún no hay fotos en esta entrega.</p>
      </div>
    </div>
  );

  const coverPhoto = photos[0];

  return (
    <div className="min-h-screen" style={{ background: bgStyle, color: textColor }}>

      {/* ── PORTADA ─────────────────────────────────────────── */}
      {coverVisible && (
        <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
          {/* background blur */}
          <div className="absolute inset-0">
            <img src={coverPhoto.url} alt="" className="w-full h-full object-cover scale-110" style={{ filter: 'blur(24px)', opacity: 0.35 }} />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.65) 100%)` }} />
          </div>

          {/* content */}
          <div className="relative z-10 text-center px-6 max-w-2xl animate-fade-in">
            <p className="text-sm font-medium mb-4 tracking-widest uppercase" style={{ color: accent }}>
              {info.clientName || 'Galería'}
            </p>
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-3 leading-tight">
              {info.name}
            </h1>
            {info.subtitle && (
              <p className="text-lg text-white/60 mb-8">{info.subtitle}</p>
            )}
            <button
              onClick={() => setCoverVisible(false)}
              className="inline-flex items-center gap-2 text-white font-semibold px-8 py-3 rounded-2xl text-sm transition-all hover:opacity-90 active:scale-95 mt-4"
              style={{ background: accent }}
            >
              Ver galería <ChevronDown size={16} />
            </button>
          </div>

          {/* photo count */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-widest">
            {photos.length} FOTO{photos.length !== 1 ? 'S' : ''}
          </div>
        </div>
      )}

      {/* ── HEADER ──────────────────────────────────────────── */}
      {!coverVisible && (
        <div className="sticky top-0 z-10 backdrop-blur-md border-b" style={{
          background: isDarkBg ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.85)',
          borderColor: isDarkBg ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
        }}>
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-sm font-semibold truncate" style={{ color: textColor }}>{info.name}</h1>
              <p className="text-xs" style={{ color: textMuted }}>{photos.length} fotos</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* view toggle */}
              <div className="flex items-center rounded-xl border overflow-hidden" style={{ borderColor: isDarkBg ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' }}>
                <button
                  onClick={() => setView('grid')}
                  className="p-2 transition-colors"
                  style={{ background: view === 'grid' ? accent : 'transparent', color: view === 'grid' ? '#fff' : textMuted }}
                  title="Cuadrícula"
                ><Grid3X3 size={15} /></button>
                <button
                  onClick={() => setView('scroll')}
                  className="p-2 transition-colors"
                  style={{ background: view === 'scroll' ? accent : 'transparent', color: view === 'scroll' ? '#fff' : textMuted }}
                  title="Scroll"
                ><AlignJustify size={15} /></button>
              </div>
              <button
                onClick={handleDownloadAll}
                disabled={downloading}
                className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ background: accent }}
              >
                <FolderDown size={15} />
                <span className="hidden sm:inline">{downloading ? 'Preparando...' : 'Descargar todo'}</span>
              </button>
              <button
                onClick={() => setCoverVisible(true)}
                className="p-2 rounded-xl border text-xs"
                style={{ borderColor: isDarkBg ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)', color: textMuted }}
                title="Ver portada"
              >↑</button>
            </div>
          </div>
        </div>
      )}

      {/* ── FOTOS ───────────────────────────────────────────── */}
      {!coverVisible && (
        <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-6">

          {/* GRID MODE */}
          {view === 'grid' && (
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-2 sm:gap-3">
              {photos.map((photo, i) => (
                <div
                  key={photo.id}
                  className="group relative mb-2 sm:mb-3 rounded-xl overflow-hidden cursor-pointer break-inside-avoid"
                  onClick={() => setLightbox(i)}
                  style={{ animationDelay: `${Math.min(i * 30, 400)}ms` }}
                >
                  <img
                    src={photo.url}
                    alt={photo.originalName}
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                    style={{ display: 'block' }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors" />
                  <button
                    onClick={e => { e.stopPropagation(); downloadFile(photo.url, photo.originalName); }}
                    className="absolute bottom-2 right-2 p-2 rounded-lg bg-white/90 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    title="Descargar"
                  >
                    <Download size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* SCROLL MODE */}
          {view === 'scroll' && (
            <div className="max-w-2xl mx-auto space-y-3">
              {photos.map((photo, i) => (
                <div
                  key={photo.id}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer"
                  onClick={() => setLightbox(i)}
                >
                  <img
                    src={photo.url}
                    alt={photo.originalName}
                    className="w-full object-contain transition-transform duration-500 group-hover:scale-[1.01]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
                  <button
                    onClick={e => { e.stopPropagation(); downloadFile(photo.url, photo.originalName); }}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/90 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download size={12} /> Descargar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── LIGHTBOX ────────────────────────────────────────── */}
      {lightbox !== null && (
        <DeliveryLightbox
          photos={photos}
          index={lightbox}
          accent={accent}
          onClose={() => setLightbox(null)}
          onNav={nav}
        />
      )}
    </div>
  );
}
