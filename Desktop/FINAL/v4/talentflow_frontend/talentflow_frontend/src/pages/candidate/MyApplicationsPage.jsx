import { useEffect, useState } from "react";
import { applicationsAPI, settingsAPI } from "api";
import { Spinner, StatusBadge, EmptyState, Button, Modal } from "components/ui";
import { formatDate, formatDateTime } from "utils/helpers";
import { FileText, Download, Calendar, Video, Clock } from "lucide-react";

export default function MyApplicationsPage() {
  const [apps, setApps]         = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [detail, setDetail]     = useState(null);

  useEffect(() => {
    Promise.all([applicationsAPI.mine(), settingsAPI.get()])
      .then(([a, s]) => { setApps(a.data); setSettings(s.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><Spinner size={32} /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mes candidatures</h1>
          <p className="page-subtitle">{apps.length} candidature(s)</p>
        </div>
      </div>

      {apps.length === 0
        ? <EmptyState icon="📋" title="Aucune candidature" description="Parcourez les offres pour postuler" />
        : <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {apps.map(a => (
              <div key={a.id} className="card" style={{
                display:"flex", alignItems:"center", justifyContent:"space-between", gap:16,
                borderColor: a.status === "selected" ? "var(--primary-muted)" : undefined,
                background:  a.status === "selected" ? "var(--primary-light)" : undefined,
              }}>
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:600, fontSize:15 }}>{a.offer_title}</p>
                  <p style={{ fontSize:12, color:"var(--text2)", marginTop:2 }}>
                    Envoyée le {formatDate(a.applied_at)}
                    {a.score != null && <span style={{ marginLeft:12 }}>· Score : <strong>{a.score}/100</strong></span>}
                  </p>
                  {a.interview_booked_at && (
                    <p style={{ fontSize:12, color:"var(--success)", marginTop:4, display:"flex", alignItems:"center", gap:5 }}>
                      <Clock size={12} /> Entretien : {formatDateTime(a.interview_booked_at)}
                    </p>
                  )}
                </div>

                <StatusBadge status={a.status} />

                {a.status === "selected" && (
                  <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                    {!a.interview_booked_at && settings?.calendly_link && (
                      <a href={settings.calendly_link} target="_blank" rel="noreferrer" className="btn btn-blue btn-sm">
                        <Calendar size={13} /> Réserver
                      </a>
                    )}
                    {(a.interview_meet_link || null) && (
                      <a href={a.interview_meet_link || settings.google_meet_link} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                        <Video size={13} /> Meet
                      </a>
                    )}
                  </div>
                )}

                <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                  <Button size="sm" variant="outline" onClick={() => setDetail(a)}><FileText size={13} /> Détail</Button>
                  {a.cv_filename && (
                    <a href={applicationsAPI.cvUrl(a.id)} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                      <Download size={13} /> CV
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
      }

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Détail de la candidature">
        {detail && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div><p className="field-label">Poste</p><p style={{ fontWeight:500 }}>{detail.offer_title}</p></div>
            <div><p className="field-label">Statut</p><StatusBadge status={detail.status} /></div>
            {detail.score != null && <div><p className="field-label">Score RH</p><p style={{ fontWeight:500 }}>{detail.score}/100</p></div>}
            {detail.interview_booked_at && (
              <div>
                <p className="field-label">Date d'entretien</p>
                <p style={{ fontWeight:500, color:"var(--success)", display:"flex", alignItems:"center", gap:6 }}>
                  <Clock size={14} /> {formatDateTime(detail.interview_booked_at)}
                </p>
              </div>
            )}
            <div>
              <p className="field-label">Lettre de motivation</p>
              <p style={{ fontSize:14, color:"var(--text2)", lineHeight:1.6, background:"var(--surface2)", padding:12, borderRadius:"var(--radius-sm)" }}>{detail.motivation}</p>
            </div>
            {detail.status === "selected" && (
              <div style={{ background:"var(--primary-light)", border:"1px solid var(--primary-muted)", borderRadius:"var(--radius)", padding:16 }}>
                <p style={{ fontWeight:600, color:"var(--primary)", marginBottom:10 }}>🎉 Vous êtes sélectionné(e) !</p>
                {detail.interview_booked_at ? (
                  <p style={{ fontSize:13, color:"var(--success)", marginBottom:10 }}>✓ Entretien réservé le {formatDateTime(detail.interview_booked_at)}</p>
                ) : (
                  <p style={{ fontSize:13, color:"var(--text2)", marginBottom:10 }}>Réservez votre créneau d'entretien :</p>
                )}
                <div style={{ display:"flex", gap:8 }}>
                  {!detail.interview_booked_at && settings?.calendly_link && (
                    <a href={settings.calendly_link} target="_blank" rel="noreferrer" className="btn btn-blue btn-sm">
                      <Calendar size={13} /> Réserver sur Cal.com
                    </a>
                  )}
                  {(detail.interview_meet_link || null) && (
                    <a href={detail.interview_meet_link || settings.google_meet_link} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                      <Video size={13} /> Rejoindre Meet
                    </a>
                  )}
                </div>
              </div>
            )}
            <div className="modal-footer">
              <Button variant="outline" onClick={() => setDetail(null)}>Fermer</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
