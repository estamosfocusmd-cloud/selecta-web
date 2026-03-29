import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2, Copy, Check, ExternalLink, ChevronDown, ChevronUp, X, ImageOff } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import { api, getApiError } from '../../utils/api';
import { Gallery, Selection } from '../../types';

function CopyLinkButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };
  return (
    <button onClick={copy} className={`btn-secondary text-sm px-4 py-2 ${copied ? 'text-emerald-600 border-emerald-300 dark:border-emerald-700' : ''}`}>
      {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar enlace</>}
    </button>
  );
}

export default function GalleryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [expandedSelection, setExpandedSelection] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchGallery = useCallback(async () => {
    if (!id) return;
    try {
      const [galleryRes, selectionsRes] = await Promise.all([
        api.get(`/galleries/${id}`),
        api.get(`/galleries/${id}/selections`)
      ]);
      setGallery(galleryRes.data);
      setSelections(selectionsRes.data);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchGallery(); }, [fetchGallery]);

  const uploadFiles = async (files: FileList | File[]) => {
    if (!id || files.length === 0) return;
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('photos', f));
    setUploading(true);
    setUploadProgress(0);
    try {
      await api.post(`/galleries/${id}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => {
          if (e.total) setUploadProgress(Math.round((e.loaded * 100) / e.total));
        }
      });
      await fetchGallery();
    } catch (err) {
      alert(getApiError(err));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) uploadFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!id || !gallery) return;
    try {
      await api.delete(`/galleries/${id}/photos/${photoId}`);
      setGallery(g => g ? { ...g, photos: g.photos.filter(p => p.id !== photoId) } : g);
    } catch (err) {
      alert(getApiError(err));
    }
  };

  const handleToggleStatus = async () => {
    if (!gallery) return;
    const newStatus = gallery.status === 'active' ? 'closed' : 'active';
    try {
      const res = await api.patch(`/galleries/${id}`, { status: newStatus });
      setGallery(res.data);
    } catch (err) {
      alert(getApiError(err));
    }
  };

  const handleDelete = async () => {
    if (!gallery || !confirm(`¿Eliminar "${gallery.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/galleries/${id}`);
      navigate('/dashboard');
    } catch (err) {
      alert(getApiError(err));
    }
  };

  const galleryUrl = gallery ? `${window.location.origin}/g/${gallery.slug}` : '';
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Navbar variant="dashboard" />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded w-48" />
          <div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded w-32" />
          <div className="h-48 bg-gray-100 dark:bg-zinc-800 rounded-2xl" />
        </div>
      </div>
    </div>
  );

  if (error || !gallery) return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Navbar variant="dashboard" />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-red-500">{error || 'Galería no encontrada'}</p>
        <Link to="/dashboard" className="btn-secondary mt-4">Volver</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Navbar variant="dashboard" />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
          <ArrowLeft size={16} />
          Mis galerías
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{gallery.name}</h1>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                gallery.status === 'active'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                  : 'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400'
              }`}>
                {gallery.status === 'active' ? 'Activa' : 'Cerrada'}
              </span>
            </div>
            {gallery.clientName && (
              <p className="text-sm text-gray-500 dark:text-zinc-400">{gallery.clientName}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleToggleStatus}
              className="btn-secondary text-sm px-4 py-2"
            >
              {gallery.status === 'active' ? 'Cerrar galería' : 'Reactivar'}
            </button>
            <button onClick={handleDelete} className="btn-ghost p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950" title="Eliminar galería">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Enlace para compartir</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 font-mono truncate">
              {galleryUrl}
            </div>
            <div className="flex items-center gap-2">
              <CopyLinkButton text={galleryUrl} />
              <Link to={`/g/${gallery.slug}`} target="_blank" className="btn-ghost p-2" title="Abrir galería">
                <ExternalLink size={16} />
              </Link>
            </div>
          </div>
          {gallery.hasPassword && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
              🔒 Esta galería está protegida con contraseña
            </p>
          )}
        </div>

        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Fotos ({gallery.photos.length})
            </h2>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-primary text-xs px-3 py-1.5"
            >
              <Upload size={13} />
              {uploading ? `${uploadProgress}%` : 'Subir fotos'}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileInput}
          />

          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors mb-4 cursor-pointer ${
              isDragging
                ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-zinc-800'
                : 'border-gray-200 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500'
            }`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            {uploading ? (
              <div className="space-y-3">
                <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2">
                  <div className="bg-gray-900 dark:bg-white h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="text-sm text-gray-500 dark:text-zinc-400">Subiendo... {uploadProgress}%</p>
              </div>
            ) : (
              <>
                <Upload size={24} className="mx-auto text-gray-400 dark:text-zinc-500 mb-2" />
                <p className="text-sm text-gray-500 dark:text-zinc-400">
                  Arrastra fotos aquí o <span className="underline">haz click</span>
                </p>
                <p className="text-xs text-gray-400 dark:text-zinc-600 mt-1">JPG, PNG, WebP · Hasta 30MB por foto</p>
              </>
            )}
          </div>

          {gallery.photos.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-zinc-500">
              <ImageOff size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aún no hay fotos en esta galería</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {gallery.photos.map(photo => (
                <div key={photo.id} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-800">
                  <img
                    src={photo.url}
                    alt={photo.originalName}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    title="Eliminar foto"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Selecciones recibidas ({selections.length})
          </h2>

          {selections.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-6">
              Aún no has recibido ninguna selección
            </p>
          ) : (
            <div className="space-y-3">
              {selections.map(sel => (
                <div key={sel.id} className="border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedSelection(expandedSelection === sel.id ? null : sel.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{sel.clientName}</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                        {sel.selectedPhotos.length} fotos · {formatDate(sel.submittedAt)}
                      </p>
                    </div>
                    {expandedSelection === sel.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </button>

                  {expandedSelection === sel.id && (
                    <div className="px-4 pb-4 border-t border-gray-100 dark:border-zinc-800">
                      {sel.note && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800 rounded-lg p-3 mb-3 mt-3">
                          "{sel.note}"
                        </p>
                      )}
                      <div className="space-y-1 mt-3">
                        <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium mb-2">Archivos seleccionados:</p>
                        {sel.selectedPhotoDetails.map(p => (
                          <div key={p.id} className="text-xs font-mono text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800 rounded px-3 py-1.5">
                            {p.originalName}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
