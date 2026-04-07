import { useEffect, useState } from "react";
import { applicationsAPI, offersAPI } from "api";
import {
  Spinner, StatusBadge, EmptyState, Modal,
  Button, ErrorAlert, Avatar,
} from "components/ui";
import { formatDate, getApiError } from "utils/helpers";
import { FileText, Download, Star } from "lucide-react";
import toast from "react-hot-toast";

export default function ApplicationsPage() {
  const [apps, setApps]               = useState([]);
  const [offers, setOffers]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filterOffer, setFilterOffer] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [detail, setDetail]           = useState(null);
  const [newStatus, setNewStatus]     = useState("");
  const [score, setScore]             = useState("");
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");

  const load = () => {
    const params = {};
    if (filterOffer)  params.offer_id = filterOffer;
    if (filterStatus) params.status   = filterStatus;
    return applicationsAPI.list(params)
      .then((r) => setApps(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    offersAPI.list().then((r) => setOffers(r.data));
    load();
  }, []);

  useEffect(() => { setLoading(true); load(); }, [filterOffer, filterStatus]);

  const openDetail = (app) => {
    setDetail(app);
    setNewStatus(app.status);
    setScore(app.score ?? "");
    setError("");
  };

  const handleUpdate = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = { status: newStatus };
      if (score !== "") payload.score = parseInt(score);
      await applicationsAPI.updateStatus(detail.id, payload);
      toast.success("Candidature mise à jour");
      setDetail(null);
      setLoading(true);
      load();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-[26px]">Candidatures</h1>
          <p className="text-text2 text-[14px] mt-1">{apps.length} candidature(s)</p>
        </div>
        <div className="flex gap-3">
          <select className="field-input w-52" value={filterOffer}
            onChange={(e) => setFilterOffer(e.target.value)}>
            <option value="">Toutes les offres</option>
            {offers.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
          </select>
          <select className="field-input w-44" value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="reviewed">Examinée</option>
            <option value="selected">Sélectionné(e)</option>
            <option value="rejected">Refusée</option>
            <option value="hired">Embauché(e)</option>
          </select>
        </div>
      </div>

      {apps.length === 0 ? (
        <EmptyState icon="📋" title="Aucune candidature"
          description="Aucune candidature ne correspond aux filtres" />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Candidat</th><th>Offre</th><th>Envoyée le</th>
                <th>Statut</th><th>Score</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={a.candidate_name} role="candidate" size={30} />
                      <div>
                        <p className="font-medium text-[13px]">{a.candidate_name}</p>
                        <p className="text-text3 text-[11px]">{a.candidate_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-text2 text-[13px]">{a.offer_title}</td>
                  <td className="text-text2 text-[13px]">{formatDate(a.applied_at)}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    {a.score != null
                      ? <span className="flex items-center gap-1 text-[13px] font-medium">
                          <Star size={12} className="text-gold" fill="currentColor" />{a.score}/100
                        </span>
                      : "—"}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Button size="sm" variant="accent" onClick={() => openDetail(a)}>
                        <FileText size={13} /> Réviser
                      </Button>
                      {a.cv_filename && (
                        <a href={applicationsAPI.cvUrl(a.id)} target="_blank" rel="noreferrer"
                          className="btn btn-ghost btn-sm">
                          <Download size={13} /> CV
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Dossier candidat" maxWidth="max-w-xl">
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-surface2 rounded">
              <Avatar name={detail.candidate_name} role="candidate" size={40} />
              <div>
                <p className="font-medium">{detail.candidate_name}</p>
                <p className="text-text2 text-[13px]">{detail.candidate_email}</p>
                {detail.candidate_phone && <p className="text-text3 text-[12px]">{detail.candidate_phone}</p>}
              </div>
            </div>
            <div>
              <p className="field-label">Offre</p>
              <p className="font-medium">{detail.offer_title}</p>
            </div>
            <div>
              <p className="field-label">Lettre de motivation</p>
              <p className="text-[14px] text-text2 leading-relaxed bg-surface2 p-3 rounded max-h-40 overflow-y-auto">
                {detail.motivation}
              </p>
            </div>

            <hr className="border-border" />
            <ErrorAlert message={error} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">Statut</label>
                <select className="field-input" value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}>
                  <option value="pending">En attente</option>
                  <option value="reviewed">Examinée</option>
                  <option value="selected">Sélectionné(e) — envoie Calendly</option>
                  <option value="rejected">Refusée</option>
                  <option value="hired">Embauché(e)</option>
                </select>
              </div>
              <div>
                <label className="field-label">Score (0–100)</label>
                <input type="number" min="0" max="100" className="field-input"
                  placeholder="Ex: 85" value={score}
                  onChange={(e) => setScore(e.target.value)} />
              </div>
            </div>

            {newStatus === "selected" && (
              <div className="p-3 bg-accent-light rounded text-[13px] text-accent border border-accent/20">
                📅 Le candidat recevra automatiquement le lien Calendly + Google Meet configuré dans les paramètres.
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="ghost" onClick={() => setDetail(null)}>Annuler</Button>
              <Button variant="accent" loading={saving} onClick={handleUpdate}>Enregistrer</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
