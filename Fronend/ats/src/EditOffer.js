import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditOffer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skills: "",
    date_start: "",
    date_close: "",
    status: "open",
    interview_date: "",
    created_by: 1,
  });

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/offers/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          title: data.title,
          description: data.description,
          skills: data.skills ? data.skills.join(", ") : "",
          date_start: data.date_start,
          date_close: data.date_close,
          status: data.status,
          interview_date: data.interview_date || "",
          created_by: data.created_by,
        });
      })
      .catch((err) => console.error("Error loading offer:", err));
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      skills: formData.skills.split(",").map((s) => s.trim()),
      created_by: Number(formData.created_by),
      interview_date: formData.interview_date || null,
    };

    try {
      await fetch(`http://127.0.0.1:8000/offers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      navigate("/");
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  return (
    <div>
      <h2>Edit Offer</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Skills (comma-separated)</label>
          <input type="text" name="skills" value={formData.skills} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Start Date</label>
          <input type="date" name="date_start" value={formData.date_start} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Close Date</label>
          <input type="date" name="date_close" value={formData.date_close} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Interview Date</label>
          <input type="date" name="interview_date" value={formData.interview_date} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="form-group">
          <label>Created By (user ID)</label>
          <input type="number" name="created_by" value={formData.created_by} onChange={handleChange} required />
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button type="button" onClick={() => navigate("/")}>Cancel</button>
          <button type="submit">Save Changes</button>
        </div>
      </form>
    </div>
  );
}

export default EditOffer;