import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import NewGallery from './pages/dashboard/NewGallery';
import GalleryDetail from './pages/dashboard/GalleryDetail';
import GalleryEntry from './pages/gallery/GalleryEntry';
import GalleryView from './pages/gallery/GalleryView';
import Success from './pages/gallery/Success';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
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
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/gallery/new" element={<ProtectedRoute><NewGallery /></ProtectedRoute>} />
            <Route path="/dashboard/gallery/:id" element={<ProtectedRoute><GalleryDetail /></ProtectedRoute>} />
            <Route path="/g/:slug" element={<GalleryEntry />} />
            <Route path="/g/:slug/view" element={<GalleryView />} />
            <Route path="/g/:slug/success" element={<Success />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
