import { Link } from 'react-router-dom';
import { Moon, Sun, ArrowRight, Image, Lock, Share2, CheckSquare } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/brand/Logo';

export default function Landing() {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
      <header className="border-b border-gray-100 dark:border-zinc-900">
        <div className="max-w-screen-lg mx-auto px-6 h-16 flex items-center justify-between">
          <Logo variant="auto" size="md" />
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="btn-ghost p-2">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              className="btn-primary text-sm px-4 py-2"
            >
              {isAuthenticated ? 'Ir al panel' : 'Acceder'}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-screen-lg mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full px-3 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            Para fotógrafos profesionales
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white leading-none mb-6">
            Galerías privadas.<br />
            <span className="text-gray-400 dark:text-zinc-500">Selección simple.</span>
          </h1>

          <p className="text-lg text-gray-500 dark:text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Comparte tus trabajos con clientes de forma privada. Deja que elijan sus fotos favoritas en segundos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn-primary px-6 py-3 text-base w-full sm:w-auto">
              {isAuthenticated ? 'Ir al panel' : 'Empezar gratis'}
              <ArrowRight size={16} />
            </Link>
            <a href="#features" className="btn-secondary px-6 py-3 text-base w-full sm:w-auto">
              Cómo funciona
            </a>
          </div>
        </section>

        <section id="features" className="max-w-screen-lg mx-auto px-6 py-20 border-t border-gray-100 dark:border-zinc-900">
          <h2 className="text-2xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Todo lo que necesitas
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Lock size={20} />,
                title: 'Galerías privadas',
                desc: 'Cada galería tiene su propio link único o contraseña. Solo tus clientes pueden acceder.'
              },
              {
                icon: <CheckSquare size={20} />,
                title: 'Selección intuitiva',
                desc: 'Tus clientes seleccionan fotos con un clic. Contador visible en todo momento.'
              },
              {
                icon: <Image size={20} />,
                title: 'Vista ampliada',
                desc: 'Lightbox para ver cada foto en detalle antes de decidir. Navegación con teclado.'
              },
              {
                icon: <Share2 size={20} />,
                title: 'Link compartible',
                desc: 'Genera un enlace único al instante y compártelo por cualquier medio.'
              }
            ].map((f, i) => (
              <div key={i} className="group p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 hover:border-brand-500/40 dark:hover:border-brand-500/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-gray-400 mb-4 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-screen-lg mx-auto px-6 py-20">
          <div className="rounded-3xl bg-brand-dark p-10 sm:p-16 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Seleccioná. Confirmá. Listo.
            </h2>
            <p className="text-brand-200 mb-8 max-w-sm mx-auto">
              Crea tu primera galería en menos de un minuto.
            </p>
            <Link to={isAuthenticated ? '/dashboard' : '/register'} className="inline-flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-brand-600 transition-colors">
              {isAuthenticated ? 'Ir al panel' : 'Crear cuenta'}
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 dark:border-zinc-900 py-8">
        <div className="max-w-screen-lg mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo variant="auto" size="sm" />
          <p className="text-xs text-gray-400 dark:text-zinc-600">
            © {new Date().getFullYear()} Selecta. Galerías privadas para fotógrafos.
          </p>
        </div>
      </footer>
    </div>
  );
}
