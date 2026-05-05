import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "context/AuthContext";
import ProtectedRoute from "components/layout/ProtectedRoute";
import AppLayout from "components/layout/AppLayout";

import AuthPage            from "pages/auth/AuthPage";
import Dashboard           from "pages/Dashboard";
import OffersPage          from "pages/candidate/OffersPage";
import MyApplicationsPage  from "pages/candidate/MyApplicationsPage";
import ApplyPage           from "pages/candidate/ApplyPage";
import NotificationsPage   from "pages/candidate/NotificationsPage";
import ManageOffersPage    from "pages/rh/ManageOffersPage";
import OfferFormPage       from "pages/rh/OfferFormPage";
import ApplicationsPage    from "pages/rh/ApplicationsPage";
import CandidateDossierPage from "pages/rh/CandidateDossierPage";
import SettingsPage        from "pages/rh/SettingsPage";
import AdminUsersPage      from "pages/admin/AdminUsersPage";
import AdminOffersPage     from "pages/admin/AdminOffersPage";
import CreateUserPage      from "pages/admin/CreateUserPage";
import ProfilePage         from "pages/ProfilePage";

function Layout({ children, roles }) {
  return (
    <ProtectedRoute roles={roles}>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F5F6F8",
      }}>
        <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login"    element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />

      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/profile"   element={<Layout><ProfilePage /></Layout>} />

      <Route path="/offers"          element={<Layout roles={["candidat"]}><OffersPage /></Layout>} />
      <Route path="/apply/:id"       element={<Layout roles={["candidat"]}><ApplyPage /></Layout>} />
      <Route path="/my-applications" element={<Layout roles={["candidat"]}><MyApplicationsPage /></Layout>} />
      <Route path="/notifications"   element={<Layout roles={["candidat"]}><NotificationsPage /></Layout>} />

      <Route path="/manage-offers"          element={<Layout roles={["rh","admin"]}><ManageOffersPage /></Layout>} />
      <Route path="/manage-offers/new"      element={<Layout roles={["rh","admin"]}><OfferFormPage /></Layout>} />
      <Route path="/manage-offers/:id/edit" element={<Layout roles={["rh","admin"]}><OfferFormPage /></Layout>} />

      <Route path="/applications" element={<Layout roles={["rh","admin"]}><ApplicationsPage /></Layout>} />
      <Route path="/dossier/:id"  element={<Layout roles={["rh","admin"]}><CandidateDossierPage /></Layout>} />
      <Route path="/settings"     element={<Layout roles={["rh","admin"]}><SettingsPage /></Layout>} />

      <Route path="/admin/users/new" element={<Layout roles={["admin"]}><CreateUserPage /></Layout>} />
      <Route path="/admin/users"     element={<Layout roles={["admin"]}><AdminUsersPage /></Layout>} />
      <Route path="/admin/offers"    element={<Layout roles={["admin"]}><AdminOffersPage /></Layout>} />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
