import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { LogActivity } from './pages/LogActivity';
import { MyMonsters } from './pages/MyMonsters';
import { MonsterDetail } from './pages/MonsterDetail';
import { Auth } from './pages/Auth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />
      <main>{children}</main>
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
          path="/monsters"
          element={
            <ProtectedRoute>
              <AppLayout><MyMonsters /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/monsters/:id"
          element={
            <ProtectedRoute>
              <AppLayout><MonsterDetail /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
