import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import { authAPI } from "api";
import { Button, Input, ErrorAlert } from "components/ui";
import { getApiError } from "utils/helpers";

export default function AuthPage() {
  const [tab, setTab]         = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm]     = useState({ name: "", email: "", password: "", phone: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try { await login(loginForm.email, loginForm.password); navigate("/dashboard"); }
    catch (err) { setError(getApiError(err)); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (regForm.password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères"); return; }
    setLoading(true);
    try {
      const res = await authAPI.register(regForm);
      localStorage.setItem("tf_token", res.data.access_token);
      localStorage.setItem("tf_user", JSON.stringify(res.data.user));
      navigate("/dashboard"); window.location.reload();
    } catch (err) { setError(getApiError(err)); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-layout">
      {/* Brand */}
      <div className="auth-brand">
        <div className="auth-brand-logo">Talent<span>Flow</span></div>
        <div className="auth-brand-content">
          <h1 className="auth-brand-title">
            Recrutez les <span>meilleurs</span> talents
          </h1>
          <p className="auth-brand-sub">Plateforme ATS moderne pour gérer vos candidatures efficacement</p>
          <div className="auth-brand-stats">
            {[{num:"3", label:"Rôles"},{num:"100%", label:"Sécurisé"},{num:"Cal.com", label:"Intégré"}].map(s => (
              <div key={s.num}>
                <div className="auth-stat-num">{s.num}</div>
                <div className="auth-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="auth-form-side">
        <div className="auth-form-inner">
          <div className="auth-tabs">
            {[{key:"login",label:"Connexion"},{key:"register",label:"Inscription"}].map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); setError(""); }}
                className={`auth-tab ${tab === t.key ? "active" : ""}`}>{t.label}</button>
            ))}
          </div>

          <ErrorAlert message={error} />

          {tab === "login" ? (
            <form onSubmit={handleLogin}>
              <h2 className="auth-title">Bon retour !</h2>
              <p className="auth-subtitle">Connectez-vous à votre espace</p>
              <Input label="Email" type="email" placeholder="vous@exemple.com"
                value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} required />
              <Input label="Mot de passe" type="password" placeholder="••••••••"
                value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} required />
              <Button type="submit" variant="primary" loading={loading}>Se connecter</Button>
              <div className="auth-demo">
                <strong>Comptes démo :</strong> candidate@demo.com · rh@demo.com · admin@demo.com
                <br />Mot de passe : <strong>demo123</strong>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <h2 className="auth-title">Créer un compte</h2>
              <p className="auth-subtitle">Rejoignez TalentFlow en tant que candidat</p>
              <Input label="Nom complet" placeholder="Votre prénom et nom"
                value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} required />
              <Input label="Email" type="email" placeholder="vous@exemple.com"
                value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} required />
              <Input label="Téléphone (optionnel)" placeholder="+216 XX XXX XXX"
                value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} />
              <Input label="Mot de passe" type="password" placeholder="Minimum 6 caractères"
                value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} required />
              <Button type="submit" variant="primary" loading={loading}>Créer mon compte</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
