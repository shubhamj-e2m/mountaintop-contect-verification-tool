import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProjectsListPage from './pages/projects/ProjectsListPage';
import CreateProjectPage from './pages/projects/CreateProjectPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import ProjectSettingsPage from './pages/projects/ProjectSettingsPage';
import PageDetailPage from './pages/projects/PageDetailPage';
import MyTasksPage from './pages/tasks/MyTasksPage';
import ActivityPage from './pages/activity/ActivityPage';
import SettingsPage from './pages/settings/SettingsPage';
import TeamManagementPage from './pages/admin/TeamManagementPage';
import { RequireRole } from './components/auth/RequireRole';
import { Loader2 } from 'lucide-react';

// Loading component for auth check
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-bg-primary flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" />
      <p className="text-text-secondary">Loading...</p>
    </div>
  </div>
);

// Protected Route wrapper with loading state
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Auth Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />}
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <ForgotPasswordPage />}
      />
      <Route
        path="/reset-password"
        element={<ResetPasswordPage />}
      />

      {/* App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsListPage />} />
        <Route path="projects/new" element={<CreateProjectPage />} />
        <Route path="projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="projects/:projectId/settings" element={<ProjectSettingsPage />} />
        <Route path="projects/:projectId/pages/:pageId" element={<PageDetailPage />} />
        <Route path="tasks" element={<MyTasksPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route
          path="admin/team"
          element={
            <RequireRole allowedRoles={['admin']}>
              <TeamManagementPage />
            </RequireRole>
          }
        />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
