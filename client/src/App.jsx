import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import VehiclesPage from './pages/VehiclesPage';
import TripsPage from './pages/TripsPage';
import MaintenancePage from './pages/MaintenancePage';
import ExpensesPage from './pages/ExpensesPage';
import DriversPage from './pages/DriversPage';
import AnalyticsPage from './pages/AnalyticsPage';
import './App.css';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<AuthPage />} />
      </Routes>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vehicles" element={<ProtectedRoute roles={['admin', 'dispatcher']}><VehiclesPage /></ProtectedRoute>} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/maintenance" element={<ProtectedRoute roles={['admin', 'dispatcher']}><MaintenancePage /></ProtectedRoute>} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/drivers" element={<DriversPage />} />
          <Route path="/analytics" element={<ProtectedRoute roles={['admin', 'dispatcher']}><AnalyticsPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
