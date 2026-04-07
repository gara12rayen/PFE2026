import { useEffect, useState } from "react";
import { settingsAPI } from "api";
import { Button, ErrorAlert, SuccessAlert } from "components/ui";
import { getApiError } from "utils/helpers";
import { Calendar, Key, ExternalLink, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [form, setForm]       = useState({ calendly_link: "", cal_api_key: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    settingsAPI.get()
      .then(r => setForm({
        calendly_link: r.data.calendly_link || "",
        cal_api_key:   r.data.cal_api_key   || "",
      }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      await settingsAPI.update({
        calendly_link: form.calendly_link || null,
        cal_api_key:   form.cal_api_key   || null,
      });
      setSuccess("Paramètres enregistrés avec succès.");
      toast.success("Sauvegardé !");
    } catch (err) { setError(getApiError(err)); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Paramètres</h1>
          <p className="page-subtitle">Configuration Cal.com pour les entretiens</p>
        </div>
      </div>

      <div style={{ maxWidth: 560 }}>
        <div className="card">
          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>Intégration Cal.com</h2>
          <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 20 }}>
            Le lien de réservation est envoyé aux candidats sélectionnés.
            La clé API permet d'afficher les entretiens réservés dans le dashboard.
          </p>

          <form onSubmit={handleSave}>
            <ErrorAlert message={error} />
            <SuccessAlert message={success} />

            {/* Cal.com booking link */}
            <div className="field">
              <label className="field-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Calendar size={13} /> Lien de réservation Cal.com
              </label>
              <input
                className="field-input"
                type="url"
                placeholder="https://cal.com/votre-nom/entretien"
                value={form.calendly_link}
                onChange={e => setForm({ ...form, calendly_link: e.target.value })}
              />
              {form.calendly_link && (
                <a href={form.calendly_link} target="_blank" rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--primary)", marginTop: 4 }}>
                  <ExternalLink size={11} /> Tester le lien
                </a>
              )}
            </div>

            {/* Cal.com API key */}
            <div className="field">
              <label className="field-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Key size={13} /> Clé API Cal.com
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="field-input"
                  type={showKey ? "text" : "password"}
                  placeholder="cal_live_xxxxxxxxxxxxxxxxxxxx"
                  value={form.cal_api_key}
                  onChange={e => setForm({ ...form, cal_api_key: e.target.value })}
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text3)" }}
                >
                  {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>
                Cal.com → Settings → Developer → API keys → New API key
              </p>
            </div>

            {/* Preview */}
            {form.calendly_link && (
              <div className="alert alert-info" style={{ marginBottom: 16 }}>
                <strong>Notification envoyée au candidat sélectionné :</strong><br />
                🎉 Félicitations ! Vous avez été sélectionné(e).<br />
                📅 Réservez votre entretien : {form.calendly_link}
              </div>
            )}

            <Button type="submit" variant="blue" loading={saving}>
              Enregistrer les paramètres
            </Button>
          </form>
        </div>

        {/* How to get API key */}
        <div className="card" style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>
            Comment obtenir votre clé API Cal.com ?
          </h3>
          <ol style={{ fontSize: 13, color: "var(--text2)", paddingLeft: 18, lineHeight: 2.2 }}>
            <li>Connectez-vous sur <a href="https://cal.com" target="_blank" rel="noreferrer" style={{ color: "var(--primary)" }}>cal.com</a></li>
            <li>Allez dans <strong>Settings → Developer → API keys</strong></li>
            <li>Cliquez <strong>"Add new key"</strong> → donnez un nom → <strong>Save</strong></li>
            <li>Copiez la clé générée (commence par <code>cal_live_</code>)</li>
            <li>Collez-la dans le champ ci-dessus</li>
          </ol>
          <div style={{ marginTop: 10, padding: "10px 14px", background: "var(--warning-light)", borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--warning)" }}>
            ⚠️ La clé API permet à TalentFlow de lire vos réservations. Ne la partagez pas.
          </div>
        </div>
      </div>
    </div>
  );
}
