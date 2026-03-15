import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddOffer() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skills: "",
    date_start: "",
    date_close: "",
    status: "open",
    interview_date: "",
    created_by: 1
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formattedData = {
      ...formData,
      skills: formData.skills.split(",").map(skill => skill.trim()),
      status: formData.status.toLowerCase(),
      interview_date: formData.interview_date || null,
    };

    fetch("http://127.0.0.1:8000/offers", {  // ✅ correct URL
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formattedData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert("Error: " + data.error);
        } else {
          alert("Offer added successfully");
          navigate("/");
        }
      })
      .catch(err => console.error(err));
  };

  return (
    <div>
      <h2>Add Offer</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Title"
          onChange={handleChange}
          required
        />
        <br /><br />

        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          name="skills"
          placeholder="Skills (React, Python...)"
          onChange={handleChange}
          required
        />
        <br /><br />

        <label>Start Date:</label>
        <input
          type="date"
          name="date_start"
          onChange={handleChange}
          required
        />
        <br /><br />

        <label>Close Date:</label>
        <input
          type="date"
          name="date_close"
          onChange={handleChange}
          required
        />
        <br /><br />

        <label>Interview Date:</label>
        <input
          type="date"
          name="interview_date"
          onChange={handleChange}
        />
        <br /><br />

        <select name="status" onChange={handleChange}>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>

        <br /><br />

        <button type="submit">Save Offer</button>
      </form>
    </div>
  );
}

export default AddOffer;