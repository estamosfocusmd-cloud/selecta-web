import { Check, Maximize2 } from 'lucide-react';
import { Photo } from '../../types';

interface PhotoCardProps {
  photo: Photo;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onOpenLightbox: (index: number) => void;
  index: number;
}

export default function PhotoCard({ photo, isSelected, onSelect, onOpenLightbox, index }: PhotoCardProps) {
  return (
    <div
      className={`relative group aspect-square overflow-hidden cursor-pointer rounded-md transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-offset-1 ring-emerald-500 ring-offset-gray-50 dark:ring-offset-zinc-950'
          : ''
      }`}
      onClick={() => onSelect(photo.id)}
    >
      <img
        src={photo.url}
        alt={photo.originalName}
        loading="lazy"
        decoding="async"
        className={`w-full h-full object-cover transition-transform duration-300 ${
          isSelected ? 'brightness-90' : 'group-hover:scale-[1.03]'
        }`}
      />

      {isSelected && (
        <div className="absolute inset-0 bg-emerald-500/20 flex items-start justify-end p-1.5 animate-fade-in pointer-events-none">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
            <Check size={13} strokeWidth={3} className="text-white" />
          </div>
        </div>
      )}

      {!isSelected && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-black/20 transition-colors pointer-events-none" />
      )}

      <button
        onClick={e => { e.stopPropagation(); onOpenLightbox(index); }}
        className="absolute bottom-1.5 right-1.5 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center
          opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100
          transition-opacity active:scale-90"
        title="Ver foto"
        aria-label="Ampliar foto"
      >
        <Maximize2 size={13} />
      </button>
    </div>
  );
}
