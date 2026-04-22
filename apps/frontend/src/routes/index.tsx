import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages
import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';

// Protected Pages
import MyReports from '../pages/protected/MyReports';
import ReporterSettings from '../pages/protected/Settings';
import AdminDashboard from '../pages/protected/Admin/Dashboard';
import AdminIncidents from '../pages/protected/Admin/Incidents';
import AdminUsers from '../pages/protected/Admin/Users';
import AdminSettings from '../pages/protected/Admin/Settings';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Reporter Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/my-reports" element={<MyReports />} />
        <Route path="/settings" element={<ReporterSettings />} />
      </Route>

      {/* Admin Only Routes */}
      <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/incidents" element={<AdminIncidents />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/settings" element={<AdminSettings />} /> 
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}