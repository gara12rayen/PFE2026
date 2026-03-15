import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Offers() {
  const [offers, setOffers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/offers");
      const data = await res.json();
      setOffers(data);
    } catch (err) {
      console.error("Error loading offers:", err);
    }
  };

  const deleteOffer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;
    try {
      await fetch(`http://127.0.0.1:8000/offers/${id}`, { method: "DELETE" });
      fetchOffers();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const getStatusClass = (status) => {
    if (status === "open") return "badge badge-open";
    if (status === "closed") return "badge badge-closed";
    return "badge badge-draft";
  };

  return (
    <div>
      <h2>Job Offers</h2>

      {offers.length === 0 && (
        <p style={{ textAlign: "center", marginTop: "60px" }}>
          No offers found. Add your first offer!
        </p>
      )}

      {offers.map((offer) => (
        <div key={offer.id} className="card">
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <h3>{offer.title}</h3>
              <p>{offer.description}</p>
              <p><strong>Skills:</strong> {offer.skills ? offer.skills.join(", ") : "None"}</p>
              <p><strong>Start:</strong> {offer.date_start} | <strong>Close:</strong> {offer.date_close}</p>
              <p><strong>Interview:</strong> {offer.interview_date || "Not scheduled"}</p>
              <span className={getStatusClass(offer.status)}>{offer.status}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button onClick={() => navigate(`/edit-offer/${offer.id}`)}>Edit</button>
              <button className="btn-danger" onClick={() => deleteOffer(offer.id)}>Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Offers;