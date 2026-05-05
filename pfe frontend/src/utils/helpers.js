// helpers.js

export function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function getApiError(err) {
  const data = err?.response?.data;
  if (!data) return "Une erreur est survenue";

  // Pydantic validation error — array of objects
  if (Array.isArray(data.detail)) {
    return data.detail.map(e => {
      const field = e.loc ? e.loc[e.loc.length - 1] : "";
      return field ? `${field}: ${e.msg}` : e.msg;
    }).join(", ");
  }

  // Simple string
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.message === "string") return data.message;
  if (typeof data === "string") return data;

  return "Une erreur est survenue";
}
