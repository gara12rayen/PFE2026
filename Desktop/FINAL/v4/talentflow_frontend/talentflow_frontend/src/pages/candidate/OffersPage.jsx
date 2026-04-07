import { useEffect, useState } from "react";
import { offersAPI, applicationsAPI } from "api";
import { Spinner, EmptyState, Modal, Button, Textarea, ErrorAlert, SuccessAlert } from "components/ui";
import { formatDate, getApiError } from "utils/helpers";
import { Search, Upload, Calendar, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function OffersPage() {
  const [offers, setOffers]     = useState([]);
  const [myApps, setMyApps]     = useState([]);   // candidate's existing applications
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [applyOffer, setApplyOffer]     = useState(null);
  const [motivation, setMotivation]     = useState("");
  const [cvFile, setCvFile]             = useState(null);
  const [applying, setApplying]         = useState(false);
  const [applyError, setApplyError]     = useState("");
  const [applySuccess, setApplySuccess] = useState("");

  const load = () =>
    Promise.all([
      offersAPI.list({ status: "open" }),
      applicationsAPI.mine(),
    ])
    .then(([o, a]) => { setOffers(o.data); setMyApps(a.data); })
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  // Set of offer IDs the candidate already applied to
  const appliedOfferIds = new Set(myApps.map(a => a.offer_id));

  const filtered = offers.filter(o => o.title.toLowerCase().includes(search.toLowerCase()));

  const openApply = (offer) => {
    setApplyOffer(offer); setMotivation(""); setCvFile(null);
    setApplyError(""); setApplySuccess("");
  };

  const handleApply = async () => {
    if (!motivation.trim()) { setApplyError("La lettre de motivation est obligatoire."); return; }
    setApplying(true); setApplyError("");
    try {
      const fd = new FormData();
      fd.append("offer_id", applyOffer.id);
      fd.append("motivation", motivation);
      if (cvFile) fd.append("cv", cvFile);
      await applicationsAPI.apply(fd);
      setApplySuccess("Candidature envoyée avec succès !");
      toast.success("Candidature envoyée !");
      // Add to applied set immediately
      setMyApps(prev => [...prev, { offer_id: applyOffer.id }]);
      setTimeout(() => setApplyOffer(null), 1500);
    } catch (err) { setApplyError(getApiError(err)); }
    finally { setApplying(false); }
  };

  if (loading) return <div className="loading-page"><Spinner size={32} /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Offres d'emploi</h1>
          <p className="page-subtitle">{offers.length} offre(s) ouverte(s)</p>
        </div>
        <div style={{ position:"relative" }}>
          <Search size={15} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--text3)" }} />
          <input className="field-input" style={{ paddingLeft:36, width:260 }} placeholder="Rechercher…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0
        ? <EmptyState icon="🔍" title="Aucune offre trouvée" />
        : <div className="card-grid">
            {filtered.map(offer => {
              const alreadyApplied = appliedOfferIds.has(offer.id);
              return (
                <div key={offer.id} className="card" style={{ display:"flex", flexDirection:"column", opacity: alreadyApplied ? 0.85 : 1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <h3 style={{ fontSize:15, fontWeight:600 }}>{offer.title}</h3>
                    {alreadyApplied && (
                      <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, fontWeight:600, padding:"3px 8px", borderRadius:20, background:"var(--success-light)", color:"var(--success)" }}>
                        <CheckCircle size={11} /> Postulé
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize:13, color:"var(--text2)", lineHeight:1.6, marginBottom:12, display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                    {offer.description}
                  </p>
                  <div style={{ marginBottom:12 }}>
                    {offer.skills?.map(s => <span key={s} className="skill-tag">{s}</span>)}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--text3)", marginBottom:16 }}>
                    <Calendar size={12} /> Clôture : {formatDate(offer.date_close)}
                  </div>
                  <div style={{ marginTop:"auto" }}>
                    {alreadyApplied ? (
                      <button
                        disabled
                        style={{
                          width:"100%", padding:"9px 18px", borderRadius:"var(--radius-sm)",
                          fontSize:14, fontWeight:500, border:"1.5px solid var(--border)",
                          background:"var(--surface2)", color:"var(--text3)",
                          cursor:"not-allowed", display:"flex", alignItems:"center",
                          justifyContent:"center", gap:7,
                        }}
                      >
                        <CheckCircle size={14} /> Déjà postulé
                      </button>
                    ) : (
                      <Button variant="blue" size="sm" style={{ width:"100%" }} onClick={() => openApply(offer)}>
                        Postuler
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
      }

      <Modal open={!!applyOffer} onClose={() => setApplyOffer(null)} title="Postuler à l'offre">
        {applyOffer && <>
          <p style={{ fontSize:13, color:"var(--text2)", marginBottom:16, fontWeight:500 }}>{applyOffer.title}</p>
          <ErrorAlert message={applyError} />
          <SuccessAlert message={applySuccess} />
          <Textarea label="Lettre de motivation *" placeholder="Expliquez pourquoi vous êtes le bon candidat…"
            value={motivation} onChange={e => setMotivation(e.target.value)} style={{ minHeight:140 }} />
          <div className="field">
            <label className="field-label">CV (PDF — max 5 Mo)</label>
            <label className="file-upload-label">
              <Upload size={15} />
              <span>{cvFile ? cvFile.name : "Cliquez pour sélectionner un PDF"}</span>
              <input type="file" accept=".pdf" style={{ display:"none" }} onChange={e => setCvFile(e.target.files[0] || null)} />
            </label>
          </div>
          <div className="modal-footer">
            <Button variant="outline" onClick={() => setApplyOffer(null)}>Annuler</Button>
            <Button variant="blue" loading={applying} onClick={handleApply}>Envoyer ma candidature</Button>
          </div>
        </>}
      </Modal>
    </div>
  );
}
