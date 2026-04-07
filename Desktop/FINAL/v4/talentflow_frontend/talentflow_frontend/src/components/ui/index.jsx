import { X } from "lucide-react";

// ── Helpers ────────────────────────────────────────────────
export function initials(name = "") {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}
export function avatarColor(role) {
  return { candidate: "#2563EB", rh: "#16A34A", admin: "#D97706" }[role] || "#64748B";
}
export function statusBadgeClass(status) {
  return `badge badge-${status}`;
}
export function statusLabel(status) {
  return { open:"Ouvert", closed:"Fermé", pending:"En attente", reviewed:"Examinée", selected:"Sélectionné(e)", rejected:"Refusée", hired:"Embauché(e)" }[status] || status;
}
export function roleName(role) {
  return { candidate:"Candidat", rh:"RH Manager", admin:"Admin" }[role] || role;
}
export function roleBadgeClass(role) {
  return `badge badge-${role}`;
}

// ── Spinner ────────────────────────────────────────────────
export function Spinner({ size = 20 }) {
  return <span className="spinner" style={{ width: size, height: size }} />;
}

// ── Button ─────────────────────────────────────────────────
export function Button({ children, variant = "blue", size = "md", loading = false, className = "", ...props }) {
  const v = { primary:"btn-primary", blue:"btn-blue", outline:"btn-outline", ghost:"btn-ghost", danger:"btn-danger", success:"btn-success", accent:"btn-blue" }[variant] || "btn-blue";
  const s = size === "sm" ? "btn-sm" : "";
  return (
    <button className={`btn ${v} ${s} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? <Spinner size={14} /> : children}
    </button>
  );
}

// ── Input ──────────────────────────────────────────────────
export function Input({ label, error, className = "", ...props }) {
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <input className={`field-input ${error ? "error" : ""} ${className}`} {...props} />
      {error && <p style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>{error}</p>}
    </div>
  );
}

// ── Select ─────────────────────────────────────────────────
export function Select({ label, error, children, className = "", ...props }) {
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <select className={`field-input ${error ? "error" : ""} ${className}`} {...props}>{children}</select>
      {error && <p style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>{error}</p>}
    </div>
  );
}

// ── Textarea ───────────────────────────────────────────────
export function Textarea({ label, error, className = "", ...props }) {
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <textarea className={`field-input ${error ? "error" : ""} ${className}`} {...props} />
      {error && <p style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>{error}</p>}
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────
export function StatusBadge({ status }) {
  return <span className={statusBadgeClass(status)}>{statusLabel(status)}</span>;
}

// ── Role Badge ─────────────────────────────────────────────
export function RoleBadge({ role }) {
  return <span className={roleBadgeClass(role)}>{roleName(role)}</span>;
}

// ── Avatar ─────────────────────────────────────────────────
export function Avatar({ name = "", role = "", size = 36 }) {
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.35, backgroundColor: avatarColor(role) }}>
      {initials(name)}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, maxWidth = "520px" }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth }}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// ── Alerts ─────────────────────────────────────────────────
export function ErrorAlert({ message }) {
  if (!message) return null;
  return <div className="alert alert-error">{message}</div>;
}
export function SuccessAlert({ message }) {
  if (!message) return null;
  return <div className="alert alert-success">{message}</div>;
}

// ── Empty state ────────────────────────────────────────────
export function EmptyState({ icon, title, description }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-desc">{description}</p>}
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────
export function StatCard({ num, label, color = "" }) {
  return (
    <div className="stat-card">
      <div className={`stat-num ${color}`}>{num ?? 0}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
