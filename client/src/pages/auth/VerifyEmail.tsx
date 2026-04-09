import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { api, getApiError } from '../../utils/api';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token    = params.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Link inválido — falta el token de verificación.'); return; }
    api.get(`/auth/verify-email?token=${token}`)
      .then(() => setStatus('success'))
      .catch(err => { setStatus('error'); setMessage(getApiError(err)); });
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        {status === 'loading' && (
          <>
            <Loader2 size={40} className="animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-zinc-400">Verificando tu cuenta...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">¡Email verificado!</h1>
            <p className="text-gray-500 dark:text-zinc-400 mb-6">Tu cuenta está activa. Ya podés iniciar sesión y empezar a usar Selecta.</p>
            <Link to="/login" className="btn-primary px-6 py-3 inline-flex">
              Ir al login
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950 flex items-center justify-center mx-auto mb-6">
              <XCircle size={32} className="text-red-500" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Link inválido</h1>
            <p className="text-gray-500 dark:text-zinc-400 mb-6">{message || 'El link expiró o ya fue usado.'}</p>
            <Link to="/login" className="btn-secondary px-6 py-3 inline-flex">
              Volver al login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
