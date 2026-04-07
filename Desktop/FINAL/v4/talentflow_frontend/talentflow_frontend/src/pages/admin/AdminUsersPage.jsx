import { useEffect, useState } from "react";
import { adminAPI } from "api";
import { Spinner, EmptyState, Modal, Button, Input, Select, ErrorAlert, SuccessAlert, Avatar, RoleBadge } from "components/ui";
import { formatDate, getApiError } from "utils/helpers";
import { Plus, UserCheck, UserX } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "context/AuthContext";

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState({ name:"", email:"", password:"", role:"rh" });
  const [creating, setCreating] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");

  const load = () => adminAPI.listUsers().then(r => setUsers(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) { setError("Tous les champs sont obligatoires."); return; }
    setCreating(true); setError("");
    try { await adminAPI.createUser(form); setSuccess(`Compte créé pour ${form.name}.`); setTimeout(() => { setModal(false); load(); }, 1200); }
    catch(err) { setError(getApiError(err)); }
    finally { setCreating(false); }
  };

  const handleToggle = async id => {
    try { await adminAPI.toggleUser(id); toast.success("Statut mis à jour"); load(); }
    catch(err) { toast.error(getApiError(err)); }
  };

  const openModal = () => { setForm({name:"",email:"",password:"",role:"rh"}); setError(""); setSuccess(""); setModal(true); };
  const f = k => ({ value:form[k], onChange:e => setForm({...form,[k]:e.target.value}) });

  if (loading) return <div className="loading-page"><Spinner size={32} /></div>;

  const staff      = users.filter(u => u.role !== "candidate");
  const candidates = users.filter(u => u.role === "candidate");

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Gestion des utilisateurs</h1><p className="page-subtitle">{users.length} compte(s)</p></div>
        <Button variant="blue" onClick={openModal}><Plus size={16} /> Nouveau compte</Button>
      </div>

      <p style={{ fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.6px", color:"var(--text2)", marginBottom:10 }}>Admins & RH Managers</p>
      <div className="table-wrap" style={{ marginBottom:24 }}>
        <table>
          <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Créé le</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {staff.map(u => (
              <tr key={u.id}>
                <td><div style={{ display:"flex", alignItems:"center", gap:10 }}><Avatar name={u.name} role={u.role} size={30} /><span style={{ fontWeight:500 }}>{u.name}</span></div></td>
                <td style={{ color:"var(--text2)", fontSize:13 }}>{u.email}</td>
                <td><RoleBadge role={u.role} /></td>
                <td style={{ color:"var(--text2)", fontSize:13 }}>{formatDate(u.created_at)}</td>
                <td><span style={{ fontSize:13, fontWeight:500, color: u.is_active ? "var(--success)" : "var(--danger)" }}>{u.is_active ? "✓ Actif" : "✗ Inactif"}</span></td>
                <td>
                  {u.id === me?.id ? <span style={{ fontSize:12, color:"var(--text3)" }}>Vous</span>
                    : <Button size="sm" variant={u.is_active ? "danger" : "outline"} onClick={() => handleToggle(u.id)}>
                        {u.is_active ? <><UserX size={13} /> Désactiver</> : <><UserCheck size={13} /> Activer</>}
                      </Button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.6px", color:"var(--text2)", marginBottom:10 }}>Candidats ({candidates.length})</p>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Nom</th><th>Email</th><th>Téléphone</th><th>Inscrit le</th><th>Statut</th></tr></thead>
          <tbody>
            {candidates.map(u => (
              <tr key={u.id}>
                <td><div style={{ display:"flex", alignItems:"center", gap:10 }}><Avatar name={u.name} role="candidate" size={30} /><span style={{ fontWeight:500 }}>{u.name}</span></div></td>
                <td style={{ color:"var(--text2)", fontSize:13 }}>{u.email}</td>
                <td style={{ color:"var(--text2)", fontSize:13 }}>{u.phone||"—"}</td>
                <td style={{ color:"var(--text2)", fontSize:13 }}>{formatDate(u.created_at)}</td>
                <td><span style={{ fontSize:13, fontWeight:500, color: u.is_active ? "var(--success)" : "var(--danger)" }}>{u.is_active ? "✓ Actif" : "✗ Inactif"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Créer un compte">
        <ErrorAlert message={error} /><SuccessAlert message={success} />
        <Input label="Nom complet *" placeholder="Prénom et nom" {...f("name")} />
        <Input label="Email *" type="email" placeholder="user@exemple.com" {...f("email")} />
        <Select label="Rôle" {...f("role")}><option value="rh">RH Manager</option><option value="admin">Administrateur</option></Select>
        <Input label="Mot de passe *" type="password" placeholder="Minimum 6 caractères" {...f("password")} />
        <div className="modal-footer">
          <Button variant="outline" onClick={() => setModal(false)}>Annuler</Button>
          <Button variant="blue" loading={creating} onClick={handleCreate}>Créer le compte</Button>
        </div>
      </Modal>
    </div>
  );
}
