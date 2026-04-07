import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import { adminAPI, applicationsAPI, offersAPI, settingsAPI, calAPI } from "api";
import { StatCard, Spinner, StatusBadge } from "components/ui";
import { formatDate, formatDateTime } from "utils/helpers";
import { Calendar, Video, ExternalLink, Clock, AlertCircle, RefreshCw } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === "candidate") return <CandidateDashboard />;
  if (user?.role === "rh")        return <RHDashboard />;
  if (user?.role === "admin")     return <AdminDashboard />;
  return null;
}

// ── Candidate dashboard ────────────────────────────────────
function CandidateDashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [apps, setApps]         = useState([]);
  const [offers, setOffers]     = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([applicationsAPI.mine(), offersAPI.list({ status: "open" }), settingsAPI.get()])
      .then(([a, o, s]) => { setApps(a.data); setOffers(o.data); setSettings(s.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><Spinner size={32} /></div>;

  const counts = {
    total:    apps.length,
    pending:  apps.filter(a => a.status === "pending").length,
    selected: apps.filter(a => a.status === "selected").length,
    rejected: apps.filter(a => a.status === "rejected").length,
  };
  const selectedApps = apps.filter(a => a.status === "selected");

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Bonjour, {user?.name?.split(" ")[0]} 👋</h1>
        <p className="page-subtitle">Voici un aperçu de votre activité</p>
      </div>

      <div className="stats-grid">
        <StatCard num={counts.total}    label="Candidatures envoyées" />
        <StatCard num={counts.pending}  label="En attente"            color="yellow" />
        <StatCard num={counts.selected} label="Sélectionné(e)"        color="blue" />
        <StatCard num={counts.rejected} label="Refusées"              color="red" />
      </div>

      {/* Interview section */}
      {selectedApps.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 className="section-title">🎉 Vos entretiens</h2>
          {selectedApps.map(a => (
            <div key={a.id} style={{
              background: "var(--primary-light)", border: "1.5px solid var(--primary-muted)",
              borderRadius: "var(--radius-lg)", padding: "16px 20px", marginBottom: 12,
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
            }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 15 }}>{a.offer_title}</p>
                {a.interview_booked_at ? (
                  <p style={{ fontSize: 13, color: "var(--success)", marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}>
                    <Clock size={13} /> <strong>Entretien réservé :</strong>&nbsp;{formatDateTime(a.interview_booked_at)}
                  </p>
                ) : (
                  <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>
                    📅 Cliquez pour réserver votre créneau
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {settings?.calendly_link && (
                  <a href={settings.calendly_link} target="_blank" rel="noreferrer" className="btn btn-blue btn-sm">
                    <Calendar size={13} /> {a.interview_booked_at ? "Modifier" : "Réserver"}
                  </a>
                )}
                {a.interview_meet_link && (
                  <a href={a.interview_meet_link} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                    <Video size={13} /> Rejoindre Meet
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <h2 className="section-title">Mes dernières candidatures</h2>
          {apps.length === 0
            ? <div className="card" style={{ fontSize: 14, color: "var(--text2)" }}>Aucune candidature.</div>
            : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {apps.slice(0, 4).map(a => (
                  <div key={a.id} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: 14 }}>{a.offer_title}</p>
                      <p style={{ fontSize: 12, color: "var(--text3)" }}>{formatDate(a.applied_at)}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
                {apps.length > 4 && (
                  <button onClick={() => navigate("/my-applications")}
                    style={{ fontSize: 13, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                    Voir toutes →
                  </button>
                )}
              </div>
          }
        </div>
        <div>
          <h2 className="section-title">Offres ouvertes</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {offers.slice(0, 4).map(o => (
              <div key={o.id} className="card card-hover" style={{ cursor: "pointer" }} onClick={() => navigate("/offers")}>
                <p style={{ fontWeight: 500, fontSize: 14 }}>{o.title}</p>
                <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>Clôture : {formatDate(o.date_close)}</p>
              </div>
            ))}
            {offers.length === 0 && <div className="card" style={{ fontSize: 14, color: "var(--text2)" }}>Aucune offre ouverte.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── RH dashboard ───────────────────────────────────────────
function RHDashboard() {
  const navigate    = useNavigate();
  const [stats, setStats]       = useState(null);
  const [selected, setSelected] = useState([]);
  const [pending, setPending]   = useState([]);
  const [settings, setSettings] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError]     = useState("");
  const [loading, setLoading]   = useState(true);

  const loadBookings = async () => {
    setBookingsLoading(true);
    setBookingsError("");
    try {
      const r = await calAPI.bookings();
      setBookings(r.data.bookings || []);
    } catch (err) {
      setBookingsError(err?.response?.data?.detail || "Impossible de charger les réservations Cal.com.");
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([
      adminAPI.stats(),
      applicationsAPI.list({ status: "selected" }),
      applicationsAPI.list({ status: "pending" }),
      settingsAPI.get(),
    ]).then(([s, sel, pend, cfg]) => {
      setStats(s.data);
      setSelected(sel.data);
      setPending(pend.data);
      setSettings(cfg.data);
      // Auto-load Cal.com bookings if API key is configured
      if (cfg.data.cal_api_key) loadBookings();
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><Spinner size={32} /></div>;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Tableau de bord RH</h1>
        <p className="page-subtitle">Vue d'ensemble du recrutement</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard num={stats?.open_offers}        label="Offres ouvertes"      color="blue" />
        <StatCard num={stats?.total_applications} label="Candidatures totales" />
        <StatCard num={stats?.pending}            label="En attente"           color="yellow" />
        <StatCard num={stats?.hired}              label="Embauchés"            color="green" />
      </div>

      {/* ── Cal.com Bookings Section ── */}
      <div style={{ marginBottom: 28 }}>
        <div className="section-title">
          📅 Entretiens réservés sur Cal.com
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {settings?.cal_api_key && (
              <button onClick={loadBookings} className="btn btn-outline btn-sm" disabled={bookingsLoading}>
                <RefreshCw size={13} style={{ animation: bookingsLoading ? "spin 1s linear infinite" : "none" }} />
                Actualiser
              </button>
            )}
            <button onClick={() => navigate("/settings")} className="btn btn-outline btn-sm">
              Paramètres →
            </button>
          </div>
        </div>

        {/* No API key configured */}
        {!settings?.cal_api_key && (
          <div className="alert alert-warning" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>
              <AlertCircle size={14} style={{ display: "inline", marginRight: 6 }} />
              Clé API Cal.com non configurée — ajoutez-la dans les paramètres pour voir les réservations ici.
            </span>
            <button onClick={() => navigate("/settings")} className="btn btn-outline btn-sm">Configurer →</button>
          </div>
        )}

        {/* Loading */}
        {bookingsLoading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 20, color: "var(--text2)", fontSize: 14 }}>
            <Spinner size={20} /> Chargement des réservations Cal.com…
          </div>
        )}

        {/* Error */}
        {bookingsError && (
          <div className="alert alert-error" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>{bookingsError}</span>
            <button onClick={loadBookings} className="btn btn-outline btn-sm">Réessayer</button>
          </div>
        )}

        {/* Bookings list */}
        {!bookingsLoading && !bookingsError && bookings.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Candidat</th>
                  <th>Email</th>
                  <th>Date & Heure</th>
                  <th>Statut</th>
                  <th>Lien Meet</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 500 }}>{b.candidate_name}</td>
                    <td style={{ fontSize: 13, color: "var(--text2)" }}>{b.candidate_email}</td>
                    <td>
                      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                        <Clock size={13} style={{ color: "var(--primary)" }} />
                        {b.start ? formatDateTime(b.start) : "—"}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                        background: b.status === "ACCEPTED" ? "var(--success-light)" : "var(--warning-light)",
                        color: b.status === "ACCEPTED" ? "var(--success)" : "var(--warning)",
                      }}>
                        {b.status === "ACCEPTED" ? "✓ Confirmé" : b.status === "PENDING" ? "⏳ En attente" : b.status}
                      </span>
                    </td>
                    <td>
                      {b.meet_url ? (
                        <a href={b.meet_url} target="_blank" rel="noreferrer" className="btn btn-blue btn-sm">
                          <Video size={12} /> Rejoindre
                        </a>
                      ) : (
                        <span style={{ fontSize: 13, color: "var(--text3)" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* No bookings yet */}
        {!bookingsLoading && !bookingsError && settings?.cal_api_key && bookings.length === 0 && (
          <div className="card" style={{ fontSize: 14, color: "var(--text2)", textAlign: "center", padding: 32 }}>
            Aucun entretien réservé pour le moment.
          </div>
        )}
      </div>

      {/* ── Selected candidates (TalentFlow side) ── */}
      <div style={{ marginBottom: 28 }}>
        <div className="section-title">
          👥 Candidats sélectionnés ({selected.length})
          <button onClick={() => navigate("/applications")} style={{ fontSize: 13, color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}>
            Gérer →
          </button>
        </div>
        {selected.length === 0
          ? <div className="card" style={{ fontSize: 14, color: "var(--text2)" }}>Aucun candidat sélectionné.</div>
          : <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Candidat</th><th>Email</th><th>Offre</th><th>Score</th><th>Lien Cal.com</th></tr>
                </thead>
                <tbody>
                  {selected.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 500 }}>{a.candidate_name}</td>
                      <td style={{ fontSize: 13, color: "var(--text2)" }}>{a.candidate_email}</td>
                      <td style={{ fontSize: 13, color: "var(--text2)" }}>{a.offer_title}</td>
                      <td>
                        {a.score != null
                          ? <span style={{ fontWeight: 600, color: "var(--primary)" }}>{a.score}/100</span>
                          : <span style={{ color: "var(--text3)" }}>—</span>
                        }
                      </td>
                      <td>
                        {settings?.calendly_link
                          ? <a href={settings.calendly_link} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                              <ExternalLink size={12} /> Cal.com
                            </a>
                          : <span style={{ fontSize: 12, color: "var(--text3)" }}>Non configuré</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </div>

      {/* ── Pending ── */}
      <div>
        <div className="section-title">
          Candidatures en attente
          <button onClick={() => navigate("/applications")} style={{ fontSize: 13, color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}>Voir tout →</button>
        </div>
        {pending.length === 0
          ? <div className="card" style={{ fontSize: 14, color: "var(--text2)" }}>Aucune candidature en attente.</div>
          : <div className="table-wrap">
              <table>
                <thead><tr><th>Candidat</th><th>Offre</th><th>Envoyée le</th><th>Statut</th></tr></thead>
                <tbody>
                  {pending.slice(0, 5).map(a => (
                    <tr key={a.id} style={{ cursor: "pointer" }} onClick={() => navigate("/applications")}>
                      <td style={{ fontWeight: 500 }}>{a.candidate_name}</td>
                      <td style={{ color: "var(--text2)" }}>{a.offer_title}</td>
                      <td style={{ color: "var(--text2)", fontSize: 13 }}>{formatDate(a.applied_at)}</td>
                      <td><StatusBadge status={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </div>
    </div>
  );
}

// ── Admin dashboard ────────────────────────────────────────
function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.stats().then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><Spinner size={32} /></div>;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Tableau de bord Admin</h1>
        <p className="page-subtitle">Supervision globale de la plateforme</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
        <StatCard num={stats?.total_offers}       label="Offres totales" />
        <StatCard num={stats?.open_offers}        label="Offres ouvertes"      color="blue" />
        <StatCard num={stats?.total_candidates}   label="Candidats inscrits" />
        <StatCard num={stats?.total_applications} label="Candidatures totales" />
        <StatCard num={stats?.pending}            label="En attente"           color="yellow" />
        <StatCard num={stats?.hired}              label="Embauchés"            color="green" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[
          { title: "Utilisateurs",       desc: "Gérer les comptes RH et Admin →",      path: "/admin/users" },
          { title: "Toutes les offres",  desc: "Vue lecture seule de toutes les offres →", path: "/admin/offers" },
          { title: "Paramètres Cal.com", desc: "Configurer le lien et la clé API →",   path: "/settings" },
        ].map(c => (
          <div key={c.path} className="card card-hover" style={{ cursor: "pointer" }} onClick={() => navigate(c.path)}>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{c.title}</p>
            <p style={{ fontSize: 13, color: "var(--text2)" }}>{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
