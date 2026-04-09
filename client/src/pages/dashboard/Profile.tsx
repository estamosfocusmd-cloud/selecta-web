import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, Instagram, MapPin, Globe, User as UserIcon, Check } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { api, getApiError } from '../../utils/api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name:       user?.name       || '',
    brandName:  user?.brandName  || '',
    bio:        user?.bio        || '',
    location:   user?.location   || '',
    socialLink: user?.socialLink || '',
    slug:       user?.slug       || ''
  });
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setSaved(false);
    setError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.patch('/users/profile', {
        name:       form.name.trim(),
        brandName:  form.brandName.trim(),
        bio:        form.bio.trim(),
        location:   form.location.trim(),
        socialLink: form.socialLink.trim(),
        slug:       form.slug.trim()
      });
      updateUser(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await api.post('/users/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser({ profileImage: res.data.profileImage });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setUploading(false);
    }
  };

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Navbar variant="dashboard" />
      <div className="max-w-screen-sm mx-auto px-4 sm:px-6 py-10">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} />
          Volver al dashboard
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Mi perfil</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-8">Tu información profesional visible en la plataforma.</p>

        {/* Avatar */}
        <div className="card mb-6 flex items-center gap-5">
          <div className="relative shrink-0">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Foto de perfil" className="w-20 h-20 rounded-2xl object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-500 dark:text-zinc-400">{initials}</span>
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center shadow-md hover:opacity-90 transition-opacity"
            >
              {uploading
                ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                : <Camera size={14} />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-zinc-400 truncate">{user?.email}</p>
            <button onClick={() => fileRef.current?.click()} className="text-xs text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 underline underline-offset-2 mt-1 transition-colors">
              Cambiar foto
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="card space-y-5">
            <div>
              <label className="label">Nombre completo</label>
              <div className="relative">
                <UserIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
                <input name="name" value={form.name} onChange={handleChange} className="input pl-9" placeholder="Juan Pérez" required />
              </div>
            </div>

            <div>
              <label className="label">Nombre de la marca</label>
              <input name="brandName" value={form.brandName} onChange={handleChange} className="input" placeholder="JP Fotografía" />
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1.5">Se mostrará como tu nombre de fotógrafo en la plataforma.</p>
            </div>

            <div>
              <label className="label">Biografía</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange as any}
                className="input resize-none h-24"
                placeholder="Fotógrafo especializado en bodas y eventos. Basado en Buenos Aires."
                maxLength={300}
              />
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1.5 text-right">{form.bio.length}/300</p>
            </div>
          </div>

          <div className="card space-y-5">
            <div>
              <label className="label">Ubicación</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
                <input name="location" value={form.location} onChange={handleChange} className="input pl-9" placeholder="Buenos Aires, Argentina" />
              </div>
            </div>

            <div>
              <label className="label">Instagram / Red social</label>
              <div className="relative">
                <Instagram size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
                <input name="socialLink" value={form.socialLink} onChange={handleChange} className="input pl-9" placeholder="https://instagram.com/tuperfil" />
              </div>
            </div>

            <div>
              <label className="label">Nombre de usuario público</label>
              <div className="flex items-center input px-0 overflow-hidden">
                <span className="pl-3 pr-1 text-gray-400 dark:text-zinc-500 text-sm whitespace-nowrap">
                  <Globe size={14} className="inline mr-1" />/
                </span>
                <input
                  name="slug"
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                  className="flex-1 bg-transparent outline-none pr-3 py-2.5 text-sm"
                  placeholder="juanperez"
                />
              </div>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1.5">Opcional. Usado para tu link público futuro.</p>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button type="submit" disabled={saving} className={`btn-primary w-full py-3 ${saved ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}>
            {saved
              ? <span className="flex items-center gap-2 justify-center"><Check size={16} /> Guardado</span>
              : saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}
