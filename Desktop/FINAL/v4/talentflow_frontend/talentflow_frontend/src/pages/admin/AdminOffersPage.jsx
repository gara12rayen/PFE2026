import { useEffect, useState } from "react";
import { offersAPI } from "api";
import { Spinner, EmptyState, StatusBadge } from "components/ui";
import { formatDate } from "utils/helpers";

export default function AdminOffersPage() {
  const [offers, setOffers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { offersAPI.list().then(r => setOffers(r.data)).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="loading-page"><Spinner size={32} /></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Toutes les offres</h1><p className="page-subtitle">Vue admin — lecture seule</p></div>
      </div>
      {offers.length === 0 ? <EmptyState icon="📝" title="Aucune offre" /> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Titre</th><th>Statut</th><th>Créé par</th><th>Ouverture</th><th>Clôture</th><th>Candidatures</th></tr></thead>
            <tbody>
              {offers.map(o => (
                <tr key={o.id}>
                  <td>
                    <p style={{ fontWeight:500 }}>{o.title}</p>
                    <div style={{ marginTop:4 }}>{o.skills?.slice(0,3).map(s => <span key={s} className="skill-tag">{s}</span>)}</div>
                  </td>
                  <td><StatusBadge status={o.status} /></td>
                  <td style={{ color:"var(--text2)", fontSize:13 }}>{o.created_by_name||"—"}</td>
                  <td style={{ color:"var(--text2)", fontSize:13 }}>{formatDate(o.date_start)}</td>
                  <td style={{ color:"var(--text2)", fontSize:13 }}>{formatDate(o.date_close)}</td>
                  <td style={{ fontWeight:500 }}>{o.applications_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
