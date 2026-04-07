import { useEffect, useState } from "react";
import { notificationsAPI, settingsAPI } from "api";
import { Spinner, EmptyState, Button } from "components/ui";
import { formatDateTime } from "utils/helpers";
import { CheckCheck, Calendar, Video } from "lucide-react";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const [notifs, setNotifs]     = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([notificationsAPI.list(), settingsAPI.get()])
      .then(([n, s]) => { setNotifs(n.data); setSettings(s.data); })
      .finally(() => setLoading(false));
  }, []);

  const markRead  = async (id) => { await notificationsAPI.markRead(id); setNotifs(p => p.map(n => n.id === id ? {...n, is_read:true} : n)); };
  const markAll   = async () => { await notificationsAPI.markAllRead(); setNotifs(p => p.map(n => ({...n, is_read:true}))); toast.success("Tout lu !"); };
  const unread    = notifs.filter(n => !n.is_read).length;

  if (loading) return <div className="loading-page"><Spinner size={32} /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unread > 0 ? `${unread} non lue(s)` : "Tout est lu"}</p>
        </div>
        {unread > 0 && <Button variant="outline" size="sm" onClick={markAll}><CheckCheck size={14} /> Tout marquer lu</Button>}
      </div>

      {notifs.length === 0
        ? <EmptyState icon="🔔" title="Aucune notification" description="Vous serez notifié des mises à jour" />
        : <div>
            {notifs.map(n => (
              <div key={n.id} className={`notif-item ${!n.is_read ? "unread" : ""}`} onClick={() => !n.is_read && markRead(n.id)}>
                <div className={`notif-dot ${n.is_read ? "read" : ""}`} />
                <div style={{ flex:1 }}>
                  {n.message.split("\n").map((line, i) => (
                    <p key={i} className={`notif-msg ${!n.is_read && i === 0 ? "unread" : ""}`} style={{ color: i > 0 ? "var(--text2)" : undefined, fontSize: i > 0 ? 13 : undefined }}>{line}</p>
                  ))}
                  <p className="notif-time">{formatDateTime(n.created_at)}</p>
                  {n.type === "interview" && (
                    <div style={{ display:"flex", gap:8, marginTop:10 }}>
                      {settings?.calendly_link && (
                        <a href={settings.calendly_link} target="_blank" rel="noreferrer" className="btn btn-blue btn-sm" onClick={e => e.stopPropagation()}>
                          <Calendar size={13} /> Réserver mon créneau
                        </a>
                      )}
                      {null && (
                        <a href={settings.google_meet_link} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" onClick={e => e.stopPropagation()}>
                          <Video size={13} /> Google Meet
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  );
}
