import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut, LayoutDashboard, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Logo from '../brand/Logo';

interface NavbarProps {
  variant?: 'dashboard' | 'gallery' | 'minimal';
  galleryName?: string;
}

export default function Navbar({ variant = 'dashboard', galleryName }: NavbarProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="shrink-0">
            <Logo variant="auto" size="sm" />
          </Link>
          {variant === 'gallery' && galleryName && (
            <>
              <span className="text-gray-300 dark:text-zinc-600">/</span>
              <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{galleryName}</span>
            </>
          )}
          {variant === 'dashboard' && (
            <span className="hidden sm:block text-xs font-medium text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
              Panel
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {variant === 'dashboard' && isAuthenticated && (
            <Link to="/dashboard/gallery/new" className="btn-primary text-xs px-3 py-1.5 hidden sm:inline-flex">
              <Plus size={14} />
              Nueva galería
            </Link>
          )}

          <button onClick={toggleTheme} className="btn-ghost p-2" title={isDark ? 'Modo claro' : 'Modo oscuro'}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {variant === 'dashboard' && isAuthenticated && (
            <>
              <Link to="/dashboard" className="btn-ghost p-2 hidden sm:flex" title="Dashboard">
                <LayoutDashboard size={16} />
              </Link>
              <button onClick={handleLogout} className="btn-ghost p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" title="Cerrar sesión">
                <LogOut size={16} />
              </button>
            </>
          )}

          {variant === 'dashboard' && isAuthenticated && user && (
            <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l border-gray-200 dark:border-zinc-700">
              <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white dark:text-gray-900">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
