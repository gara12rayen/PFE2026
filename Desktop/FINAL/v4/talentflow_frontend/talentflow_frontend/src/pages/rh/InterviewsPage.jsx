import { useEffect, useState } from "react";
import { applicationsAPI, settingsAPI } from "api";
import { Spinner, EmptyState, StatusBadge, Avatar } from "components/ui";
import { formatDate } from "utils/helpers";
import { Calendar, Video, ChevronLeft, ChevronRight, Clock } from "lucide-react";

// ── Week helpers ──────────────────────────────────────────
function getWeekDays(baseDate) {
  const d = new Date(baseDate);
  const day = d.getDay(); // 0=Sun
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    return dd;
  });
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth()    === d2.getMonth()    &&
         d1.getDate()     === d2.getDate();
}

function formatWeekRange(days) {
  const opts = { day: "numeric", month: "long" };
  return `${days[0].toLocaleDateString("fr-FR", opts)} — ${days[6].toLocaleDateString("fr-FR", opts)}`;
}

const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function InterviewsPage() {
  const [apps, setApps]         = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [weekBase, setWeekBase] = useState(new Date());

  useEffect(() => {
    Promise.all([applicationsAPI.interviews(), settingsAPI.get()])
      .then(([a, s]) => { setApps(a.data); setSettings(s.data); })
      .finally(() => setLoading(false));
  }, []);

  const weekDays = getWeekDays(weekBase);
  const prevWeek = () => { const d = new Date(weekBase); d.setDate(d.getDate() - 7); setWeekBase(d); };
  const nextWeek = () => { const d = new Date(weekBase); d.setDate(d.getDate() + 7); setWeekBase(d); };
  const goToday  = () => setWeekBase(new Date());

  // Separate confirmed (have date) and pending (no date yet)
  const confirmed = apps.filter(a => a.interview_date);
  const pending   = apps.filter(a => !a.interview_date);

  if (loading) return <div className="loading-page"><Spinner size={32} /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Entretiens planifiés</h1>
          <p className="page-subtitle">{confirmed.length} confirmé(s) · {pending.length} en attente de date</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {settings?.calendly_link && (
            <a href={settings.calendly_link} target="_blank" rel="noreferrer"
              className="btn btn-outline btn-sm" style={{ display:"flex", alignItems:"center", gap:6 }}>
              <Calendar size={14} /> Ouvrir Cal.com
            </a>
          )}
        </div>
      </div>

      {/* ── Weekly Calendar ── */}
      <div className="card" style={{ marginBottom:24 }}>
        {/* Week navigation */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <button className="btn btn-outline btn-sm" onClick={prevWeek}><ChevronLeft size={16} /></button>
          <div style={{ textAlign:"center" }}>
            <p style={{ fontWeight:600, fontSize:15 }}>{formatWeekRange(weekDays)}</p>
            <button onClick={goToday} style={{ fontSize:12, color:"var(--primary)", marginTop:2, background:"none", border:"none", cursor:"pointer" }}>
              Aujourd'hui
            </button>
          </div>
          <button className="btn btn-outline btn-sm" onClick={nextWeek}><ChevronRight size={16} /></button>
        </div>

        {/* Week grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:8 }}>
          {weekDays.map((day, i) => {
            const dayApps = confirmed.filter(a => a.interview_date && isSameDay(new Date(a.interview_date), day));
            const isToday = isSameDay(day, new Date());
            const isPast  = day < new Date() && !isToday;

            return (
              <div key={i} style={{
                borderRadius:"var(--radius)",
                border: isToday ? "2px solid var(--primary)" : "1px solid var(--border)",
                background: isPast ? "var(--bg)" : isToday ? "var(--primary-light)" : "var(--surface)",
                padding:"10px 8px",
                minHeight:120,
              }}>
                {/* Day header */}
                <div style={{ textAlign:"center", marginBottom:8 }}>
                  <p style={{ fontSize:11, fontWeight:600, color: isToday ? "var(--primary)" : "var(--text3)", textTransform:"uppercase", letterSpacing:"0.5px" }}>
                    {DAY_NAMES[i]}
                  </p>
                  <p style={{ fontSize:18, fontWeight:700, color: isToday ? "var(--primary)" : isPast ? "var(--text3)" : "var(--text1)" }}>
                    {day.getDate()}
                  </p>
                </div>

                {/* Events */}
                {dayApps.length === 0 ? (
                  <p style={{ fontSize:11, color:"var(--text3)", textAlign:"center" }}>—</p>
                ) : (
                  dayApps.map(a => (
                    <div key={a.id} style={{
                      background: "var(--primary)",
                      borderRadius:"var(--radius-sm)",
                      padding:"6px 8px",
                      marginBottom:4,
                    }}>
                      <p style={{ fontSize:11, fontWeight:600, color:"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                        {a.candidate_name}
                      </p>
                      {a.interview_note && (
                        <p style={{ fontSize:10, color:"rgba(255,255,255,0.8)", marginTop:1 }}>
                          <Clock size={9} style={{ display:"inline", marginRight:2 }} />
                          {a.interview_note}
                        </p>
                      )}
                      <p style={{ fontSize:10, color:"rgba(255,255,255,0.7)", marginTop:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                        {a.offer_title}
                      </p>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Confirmed interviews list ── */}
      {confirmed.length > 0 && (
        <div style={{ marginBottom:24 }}>
          <h2 style={{ fontSize:16, fontWeight:600, marginBottom:12 }}>✅ Entretiens confirmés ({confirmed.length})</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Candidat</th><th>Offre</th><th>Date</th><th>Heure / Note</th><th>Score</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {confirmed
                  .sort((a,b) => new Date(a.interview_date) - new Date(b.interview_date))
                  .map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <Avatar name={a.candidate_name} role="candidate" size={30} />
                        <div>
                          <p style={{ fontWeight:500, fontSize:13 }}>{a.candidate_name}</p>
                          <p style={{ fontSize:11, color:"var(--text3)" }}>{a.candidate_email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize:13, color:"var(--text2)" }}>{a.offer_title}</td>
                    <td>
                      <span style={{ fontWeight:600, color:"var(--primary)", fontSize:13 }}>
                        {formatDate(a.interview_date)}
                      </span>
                    </td>
                    <td style={{ fontSize:13, color:"var(--text2)" }}>
                      {a.interview_note
                        ? <span style={{ display:"flex", alignItems:"center", gap:4 }}><Clock size={12} />{a.interview_note}</span>
                        : "—"
                      }
                    </td>
                    <td style={{ fontWeight:500 }}>{a.score != null ? `${a.score}/100` : "—"}</td>
                    <td>
                      <div style={{ display:"flex", gap:6 }}>
                        {settings?.google_meet_link && (
                          <a href={settings.google_meet_link} target="_blank" rel="noreferrer"
                            className="btn btn-blue btn-sm" style={{ display:"flex", alignItems:"center", gap:4 }}>
                            <Video size={12} /> Meet
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Pending (no date yet) ── */}
      <div>
        <h2 style={{ fontSize:16, fontWeight:600, marginBottom:12 }}>
          ⏳ En attente de confirmation de date ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="card" style={{ color:"var(--text2)", fontSize:14 }}>
            Tous les candidats sélectionnés ont confirmé leur date. ✅
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Candidat</th><th>Offre</th><th>Sélectionné le</th><th>Score</th><th>Lien Cal.com</th></tr>
              </thead>
              <tbody>
                {pending.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <Avatar name={a.candidate_name} role="candidate" size={30} />
                        <div>
                          <p style={{ fontWeight:500, fontSize:13 }}>{a.candidate_name}</p>
                          <p style={{ fontSize:11, color:"var(--text3)" }}>{a.candidate_email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize:13, color:"var(--text2)" }}>{a.offer_title}</td>
                    <td style={{ fontSize:13, color:"var(--text2)" }}>{formatDate(a.updated_at)}</td>
                    <td style={{ fontWeight:500 }}>{a.score != null ? `${a.score}/100` : "—"}</td>
                    <td>
                      {settings?.calendly_link ? (
                        <a href={settings.calendly_link} target="_blank" rel="noreferrer"
                          className="btn btn-outline btn-sm" style={{ display:"inline-flex", alignItems:"center", gap:4 }}>
                          <Calendar size={12} /> Cal.com
                        </a>
                      ) : <span style={{ fontSize:12, color:"var(--text3)" }}>Non configuré</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
