import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Apply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [cvFile, setCvFile] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    motivation: "",
  });

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/offers/${id}`)
      .then((res) => res.json())
      .then((data) => setOffer(data))
      .catch((err) => console.error(err));
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("offer_id", id);
    data.append("full_name", formData.full_name);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("motivation", formData.motivation);
    data.append("cv_file", cvFile);

    try {
      const res = await fetch("http://127.0.0.1:8000/apply", {
        method: "POST",
        body: data,
      });

      const result = await res.json();

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert("Error: " + (result.detail || "Something went wrong"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (submitted) {
    return (
      <div style={{ textAlign: "center", marginTop: "80px" }}>
        <h2>✅ Application Submitted!</h2>
        <p>Thank you for applying. We will review your application and get back to you.</p>
        <button onClick={() => navigate("/careers")} style={{ marginTop: "20px" }}>
          Back to Offers
        </button>
      </div>
    );
  }

  return (
    <div>
      {offer && (
        <div style={{ marginBottom: "30px" }}>
          <h2>Apply for: {offer.title}</h2>
          <p style={{ color: "#64748b" }}>{offer.description}</p>
          <p><strong>Required skills:</strong> {offer.skills?.join(", ")}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Cover Letter / Motivation</label>
          <textarea name="motivation" rows="5" placeholder="Why do you want this position?" value={formData.motivation} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Upload CV (PDF only)</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setCvFile(e.target.files[0])}
            required
          />
          {cvFile && <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>📄 {cvFile.name}</p>}
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button type="button" onClick={() => navigate("/careers")}>Cancel</button>
          <button type="submit">Submit Application</button>
        </div>
      </form>
    </div>
  );
}

export default Apply;