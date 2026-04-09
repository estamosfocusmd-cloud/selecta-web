import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/dashboard/Dashboard';
import NewGallery from './pages/dashboard/NewGallery';
import GalleryDetail from './pages/dashboard/GalleryDetail';
import Profile from './pages/dashboard/Profile';
import GalleryEntry from './pages/gallery/GalleryEntry';
import GalleryView from './pages/gallery/GalleryView';
import Success from './pages/gallery/Success';
import DeliveryEntry from './pages/gallery/DeliveryEntry';
import DeliveryView from './pages/gallery/DeliveryView';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-300 dark:border-zinc-600 border-t-gray-900 dark:border-t-white rounded-full animate-spin" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/gallery/new" element={<ProtectedRoute><NewGallery /></ProtectedRoute>} />
            <Route path="/dashboard/gallery/:id" element={<ProtectedRoute><GalleryDetail /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/g/:slug" element={<GalleryEntry />} />
            <Route path="/g/:slug/view" element={<GalleryView />} />
            <Route path="/g/:slug/success" element={<Success />} />
            <Route path="/g/:slug/entrega" element={<DeliveryEntry />} />
            <Route path="/g/:slug/entrega/view" element={<DeliveryView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
