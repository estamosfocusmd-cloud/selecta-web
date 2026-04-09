import { useEffect, useCallback, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Photo } from '../../types';

interface LightboxProps {
  photos: Photo[];
  currentIndex: number;
  selectedIds: Set<string>;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onToggleSelect: (id: string) => void;
}

export default function Lightbox({
  photos,
  currentIndex,
  selectedIds,
  onClose,
  onNavigate,
  onToggleSelect
}: LightboxProps) {
  const photo = photos[currentIndex];
  const isSelected = photo ? selectedIds.has(photo.id) : false;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const [visible, setVisible] = useState(true);
  const [dir, setDir] = useState<'left' | 'right' | null>(null);
  const isAnimating = useRef(false);

  const navigate = useCallback((index: number) => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    setDir(index > currentIndex ? 'left' : 'right');
    setVisible(false);
    setTimeout(() => {
      onNavigate(index);
      setDir(null);
      setVisible(true);
      isAnimating.current = false;
    }, 180);
  }, [currentIndex, onNavigate]);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchMoved = useRef(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && hasPrev) navigate(currentIndex - 1);
    if (e.key === 'ArrowRight' && hasNext) navigate(currentIndex + 1);
    if (e.key === ' ') { e.preventDefault(); if (photo) onToggleSelect(photo.id); }
  }, [currentIndex, hasPrev, hasNext, photo, onClose, navigate, onToggleSelect]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchMoved.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > 10 || dy > 10) touchMoved.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(dx) > 60 && dy < 100) {
      if (dx > 0 && hasPrev) navigate(currentIndex - 1);
      else if (dx < 0 && hasNext) navigate(currentIndex + 1);
    } else if (!touchMoved.current) {
      onClose();
    }
  };

  // Preload adjacent images
  useEffect(() => {
    const preload = (idx: number) => {
      if (idx >= 0 && idx < photos.length) {
        const img = new Image();
        img.src = photos[idx].url;
      }
    };
    preload(currentIndex - 1);
    preload(currentIndex + 1);
  }, [currentIndex, photos]);

  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/96 flex items-center justify-center animate-fade-in select-none">
      <div
        className="relative w-full h-full flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-11 h-11 rounded-full bg-white/10 active:bg-white/30 text-white flex items-center justify-center transition-colors"
        >
          <X size={20} />
        </button>

        <div className="absolute top-3 left-3 z-20">
          <span className="text-white/50 text-xs bg-black/30 rounded-full px-2.5 py-1">
            {currentIndex + 1} / {photos.length}
          </span>
        </div>

        <button
          onClick={() => onToggleSelect(photo.id)}
          className={`absolute top-3 right-16 z-20 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] ${
            isSelected
              ? 'bg-emerald-500 text-white'
              : 'bg-white/10 text-white active:bg-white/20'
          }`}
        >
          {isSelected ? <><Check size={15} strokeWidth={2.5} /><span>Seleccionada</span></> : <span>Seleccionar</span>}
        </button>

        {hasPrev && (
          <button
            onClick={() => navigate(currentIndex - 1)}
            className="absolute left-2 z-20 w-11 h-11 rounded-full bg-white/10 active:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {hasNext && (
          <button
            onClick={() => navigate(currentIndex + 1)}
            className="absolute right-2 z-20 w-11 h-11 rounded-full bg-white/10 active:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <ChevronRight size={22} />
          </button>
        )}

        <img
          key={photo.id}
          src={photo.url}
          alt={photo.originalName}
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateX(0)' : dir === 'left' ? 'translateX(-32px)' : dir === 'right' ? 'translateX(32px)' : 'translateX(0)',
            transition: 'opacity 0.18s ease, transform 0.18s ease',
          }}
          className="max-w-full max-h-full object-contain rounded-sm px-14"
          draggable={false}
          decoding="async"
        />

        <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
          <p className="text-white/30 text-xs">{photo.originalName}</p>
        </div>
      </div>
    </div>
  );
}
