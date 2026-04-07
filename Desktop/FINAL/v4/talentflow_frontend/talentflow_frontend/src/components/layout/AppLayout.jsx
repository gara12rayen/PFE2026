import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Briefcase, FileText, Bell, Users, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "context/AuthContext";
import { Avatar, RoleBadge } from "components/ui";

const NAV = {
  candidate: [
    { label: "Tableau de bord",  icon: LayoutDashboard, path: "/dashboard" },
    { label: "Offres d'emploi",  icon: Briefcase,       path: "/offers" },
    { label: "Mes candidatures", icon: FileText,         path: "/my-applications" },
    { label: "Notifications",    icon: Bell,             path: "/notifications" },
    { label: "Mon profil",       icon: User,             path: "/profile" },
  ],
  rh: [
    { label: "Tableau de bord",  icon: LayoutDashboard, path: "/dashboard" },
    { label: "Offres",           icon: Briefcase,        path: "/manage-offers" },
    { label: "Candidatures",     icon: FileText,         path: "/applications" },
    { label: "Paramètres",       icon: Settings,         path: "/settings" },
    { label: "Mon profil",       icon: User,             path: "/profile" },
  ],
  admin: [
    { label: "Tableau de bord",  icon: LayoutDashboard,  path: "/dashboard" },
    { label: "Utilisateurs",     icon: Users,             path: "/admin/users" },
    { label: "Toutes les offres",icon: Briefcase,         path: "/admin/offers" },
    { label: "Paramètres",       icon: Settings,          path: "/settings" },
    { label: "Mon profil",       icon: User,              path: "/profile" },
  ],
};

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const navItems  = NAV[user?.role] || [];

  return (
    <div className="app-layout">
      <header className="topbar">
        <div className="topbar-logo">Talent<span>Flow</span></div>
        <div className="topbar-right">
          <div className="topbar-user">
            <Avatar name={user?.name} role={user?.role} size={28} />
            <span style={{ fontSize:13, fontWeight:500 }}>{user?.name}</span>
            <RoleBadge role={user?.role} />
          </div>
          <button className="topbar-logout" onClick={() => { logout(); navigate("/login"); }}>
            <LogOut size={15} /> Déconnexion
          </button>
        </div>
      </header>

      <aside className="sidebar">
        <p className="sidebar-label">Navigation</p>
        {navItems.map((item) => (
          <button key={item.path} onClick={() => navigate(item.path)}
            className={`nav-item ${location.pathname === item.path ? "active" : ""}`}>
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
