import { useState } from "react";
import { useAuth } from "context/AuthContext";
import { authAPI } from "api";
import { Button, Input, ErrorAlert, SuccessAlert, Avatar } from "components/ui";
import { roleName, getApiError } from "utils/helpers";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm]     = useState({ name: user?.name||"", phone: user?.phone||"", department: user?.department||"" });
  const [pwForm, setPwForm] = useState({ current_password:"", new_password:"" });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [msg, setMsg]       = useState({ error:"", success:"" });
  const [pwMsg, setPwMsg]   = useState({ error:"", success:"" });

  const handleSave = async e => {
    e.preventDefault(); setSaving(true); setMsg({error:"",success:""});
    try { const r = await authAPI.updateMe(form); updateUser(r.data); setMsg({error:"",success:"Profil mis à jour."}); toast.success("Profil mis à jour"); }
    catch(err) { setMsg({error:getApiError(err),success:""}); }
    finally { setSaving(false); }
  };

  const handlePw = async e => {
    e.preventDefault();
    if (pwForm.new_password.length < 6) { setPwMsg({error:"Minimum 6 caractères",success:""}); return; }
    setSavingPw(true); setPwMsg({error:"",success:""});
    try { await authAPI.changePassword(pwForm); setPwMsg({error:"",success:"Mot de passe modifié."}); setPwForm({current_password:"",new_password:""}); toast.success("Mot de passe modifié"); }
    catch(err) { setPwMsg({error:getApiError(err),success:""}); }
    finally { setSavingPw(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Mon profil</h1><p className="page-subtitle">Gérez vos informations</p></div>
      </div>
      <div style={{ maxWidth:540, display:"flex", flexDirection:"column", gap:20 }}>
        <div className="card">
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
            <Avatar name={user?.name} role={user?.role} size={56} />
            <div>
              <p style={{ fontWeight:600, fontSize:17 }}>{user?.name}</p>
              <p style={{ fontSize:13, color:"var(--text2)" }}>{user?.email}</p>
              <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:20, marginTop:4, display:"inline-block",
                background: user?.role==="rh" ? "var(--primary-light)" : user?.role==="admin" ? "var(--warning-light)" : "var(--info-light)",
                color: user?.role==="rh" ? "var(--primary)" : user?.role==="admin" ? "var(--warning)" : "var(--info)" }}>
                {roleName(user?.role)}
              </span>
            </div>
          </div>
          <form onSubmit={handleSave}>
            <ErrorAlert message={msg.error} />
            <SuccessAlert message={msg.success} />
            <Input label="Nom complet" value={form.name} onChange={e => setForm({...form,name:e.target.value})} />
            <Input label="Téléphone" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} />
            {user?.role === "rh" && <Input label="Département" value={form.department} onChange={e => setForm({...form,department:e.target.value})} />}
            <Button type="submit" variant="blue" loading={saving}>Enregistrer</Button>
          </form>
        </div>
        <div className="card">
          <h2 style={{ fontSize:17, fontWeight:600, marginBottom:16 }}>Changer le mot de passe</h2>
          <form onSubmit={handlePw}>
            <ErrorAlert message={pwMsg.error} />
            <SuccessAlert message={pwMsg.success} />
            <Input label="Mot de passe actuel" type="password" value={pwForm.current_password} onChange={e => setPwForm({...pwForm,current_password:e.target.value})} required />
            <Input label="Nouveau mot de passe" type="password" value={pwForm.new_password} onChange={e => setPwForm({...pwForm,new_password:e.target.value})} required />
            <Button type="submit" variant="outline" loading={savingPw}>Modifier</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
