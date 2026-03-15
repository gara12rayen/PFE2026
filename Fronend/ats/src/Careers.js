import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Careers() {
  const [offers, setOffers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/offers")
      .then((res) => res.json())
      .then((data) => setOffers(data.filter((o) => o.status === "open")))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Open Positions</h2>

      {offers.length === 0 && (
        <p style={{ textAlign: "center", marginTop: "60px" }}>
          No open positions at the moment.
        </p>
      )}

      {offers.map((offer) => (
        <div key={offer.id} className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <h3>{offer.title}</h3>
              <p>{offer.description}</p>
              <p><strong>Skills:</strong> {offer.skills ? offer.skills.join(", ") : "None"}</p>
              <p><strong>Apply before:</strong> {offer.date_close}</p>
            </div>
            <div>
              <button onClick={() => navigate(`/apply/${offer.id}`)}>
                Apply Now
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Careers;