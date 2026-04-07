export function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", { day:"2-digit", month:"short", year:"numeric" });
}
export function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("fr-FR", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
}
export function initials(name = "") {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}
export function avatarColor(role) {
  return { candidate:"#2563EB", rh:"#16A34A", admin:"#D97706" }[role] || "#64748B";
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
export function getApiError(err) {
  return err?.response?.data?.detail || err?.response?.data?.message || "Une erreur est survenue";
}
