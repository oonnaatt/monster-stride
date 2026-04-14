import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { LogActivity } from './pages/LogActivity';
import { MyRemnons } from './pages/MyRemnons';
import { RemnonDetail } from './pages/RemnonDetail';
import { Missions } from './pages/Missions';
import { Auth } from './pages/Auth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading...
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-slate-800">
      <Navbar />
      <main className="pb-20 md:pb-0">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout><Dashboard /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/log"
          element={
            <ProtectedRoute>
              <AppLayout><LogActivity /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/remnons"
          element={
            <ProtectedRoute>
              <AppLayout><MyRemnons /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/remnons/:id"
          element={
            <ProtectedRoute>
              <AppLayout><RemnonDetail /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/missions"
          element={
            <ProtectedRoute>
              <AppLayout><Missions /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
