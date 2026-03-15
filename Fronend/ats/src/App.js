import "./App.css";
import Header from "./Header";
import Offers from "./Offers";
import AddOffer from "./AddOffer";
import EditOffer from "./EditOffer";
import Careers from "./Careers";
import Apply from "./Apply";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Offers />} />
            <Route path="/add-offer" element={<AddOffer />} />
            <Route path="/edit-offer/:id" element={<EditOffer />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/apply/:id" element={<Apply />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;