import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "context/AuthContext";
import ProtectedRoute from "components/layout/ProtectedRoute";
import AppLayout from "components/layout/AppLayout";

import AuthPage           from "pages/auth/AuthPage";
import Dashboard          from "pages/Dashboard";
import OffersPage         from "pages/candidate/OffersPage";
import MyApplicationsPage from "pages/candidate/MyApplicationsPage";
import NotificationsPage  from "pages/candidate/NotificationsPage";
import ManageOffersPage   from "pages/rh/ManageOffersPage";
import ApplicationsPage   from "pages/rh/ApplicationsPage";
import SettingsPage       from "pages/rh/SettingsPage";
import AdminUsersPage     from "pages/admin/AdminUsersPage";
import AdminOffersPage    from "pages/admin/AdminOffersPage";
import ProfilePage        from "pages/ProfilePage";

function Layout({ children, roles }) {
  return (
    <ProtectedRoute roles={roles}>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <Routes>
          <Route path="/login"    element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />

          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/profile"   element={<Layout><ProfilePage /></Layout>} />

          <Route path="/offers"          element={<Layout roles={["candidate"]}><OffersPage /></Layout>} />
          <Route path="/my-applications" element={<Layout roles={["candidate"]}><MyApplicationsPage /></Layout>} />
          <Route path="/notifications"   element={<Layout roles={["candidate"]}><NotificationsPage /></Layout>} />

          <Route path="/manage-offers" element={<Layout roles={["rh","admin"]}><ManageOffersPage /></Layout>} />
          <Route path="/applications"  element={<Layout roles={["rh","admin"]}><ApplicationsPage /></Layout>} />
          <Route path="/settings"      element={<Layout roles={["rh","admin"]}><SettingsPage /></Layout>} />

          <Route path="/admin/users"  element={<Layout roles={["admin"]}><AdminUsersPage /></Layout>} />
          <Route path="/admin/offers" element={<Layout roles={["admin"]}><AdminOffersPage /></Layout>} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
