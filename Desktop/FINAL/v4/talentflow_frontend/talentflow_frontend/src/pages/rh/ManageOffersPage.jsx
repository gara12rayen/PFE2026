import { useEffect, useState } from "react";
import { offersAPI } from "api";
import {
  Spinner, StatusBadge, EmptyState, Modal,
  Button, Input, Select, Textarea, ErrorAlert,
} from "components/ui";
import { formatDate, getApiError } from "utils/helpers";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  title: "", description: "", skills: "",
  date_start: "", date_close: "", status: "open",
};

export default function ManageOffersPage() {
  const [offers, setOffers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  const load = () => offersAPI.list().then((r) => setOffers(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setError(""); setModal(true); };
  const openEdit = (offer) => {
    setEditing(offer);
    setForm({
      title: offer.title, description: offer.description,
      skills: offer.skills?.join(", ") || "",
      date_start: offer.date_start, date_close: offer.date_close, status: offer.status,
    });
    setError(""); setModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.description || !form.date_start || !form.date_close) {
      setError("Veuillez remplir tous les champs obligatoires."); return;
    }
    setSaving(true); setError("");
    const payload = {
      ...form,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editing) { await offersAPI.update(editing.id, payload); toast.success("Offre mise à jour"); }
      else { await offersAPI.create(payload); toast.success("Offre créée"); }
      setModal(false); load();
    } catch (err) { setError(getApiError(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette offre ?")) return;
    try { await offersAPI.delete(id); toast.success("Offre supprimée"); load(); }
    catch (err) { toast.error(getApiError(err)); }
  };

  const f = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-[26px]">Gestion des offres</h1>
          <p className="text-text2 text-[14px] mt-1">{offers.length} offre(s)</p>
        </div>
        <Button variant="accent" onClick={openCreate}><Plus size={16} /> Nouvelle offre</Button>
      </div>

      {offers.length === 0 ? (
        <EmptyState icon="📝" title="Aucune offre" description="Créez votre première offre d'emploi" />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Titre</th><th>Statut</th><th>Ouverture</th><th>Clôture</th><th>Candidatures</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o.id}>
                  <td className="font-medium">{o.title}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td className="text-text2 text-[13px]">{formatDate(o.date_start)}</td>
                  <td className="text-text2 text-[13px]">{formatDate(o.date_close)}</td>
                  <td className="font-medium">{o.applications_count}</td>
                  <td>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(o)}><Pencil size={13} /></Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(o.id)}><Trash2 size={13} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)}
        title={editing ? "Modifier l'offre" : "Nouvelle offre"} maxWidth="max-w-2xl">
        <ErrorAlert message={error} />
        <div className="grid grid-cols-2 gap-x-4">
          <div className="col-span-2"><Input label="Titre du poste *" placeholder="Développeur Full Stack" {...f("title")} /></div>
          <div className="col-span-2"><Textarea label="Description *" placeholder="Décrivez le poste…" className="min-h-[100px]" {...f("description")} /></div>
          <div className="col-span-2"><Input label="Compétences (séparées par des virgules)" placeholder="React, Node.js, MySQL" {...f("skills")} /></div>
          <Input label="Date d'ouverture *" type="date" {...f("date_start")} />
          <Input label="Date de clôture *"  type="date" {...f("date_close")} />
          <div className="col-span-2">
            <Select label="Statut" {...f("status")}>
              <option value="open">Ouvert</option>
              <option value="closed">Fermé</option>
            </Select>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-4">
          <Button variant="ghost" onClick={() => setModal(false)}>Annuler</Button>
          <Button variant="accent" loading={saving} onClick={handleSave}>Enregistrer</Button>
        </div>
      </Modal>
    </div>
  );
}
