import { Link } from "react-router-dom";
import "./Header.css";

function Header() {
  return (
    <nav className="navbar">
      <div className="logo">TalentFlow ATS</div>
      <div className="nav-links">
        <Link to="/">Offers</Link>
        <Link to="/careers">Careers</Link>
        <Link to="/add-offer" className="add-btn">+ Add Offer</Link>
      </div>
    </nav>
  );
}

export default Header;