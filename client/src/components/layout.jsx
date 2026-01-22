import { Outlet, Link } from "react-router-dom";
import './layout.css'; // Design machen wir gleich

const Layout = () => {
  return (
    <div className="layout-container">
      {/* Die Seitenleiste */}
      <nav className="sidebar">
        <div className="logo">🌿 Feels Like Organic</div>
        <ul className="nav-links">
          <li><Link to="/">🏠 Dashboard</Link></li>
          <li><Link to="/training">🏃 Mein Training</Link></li>
          <li><Link to="/ranking">🏆 Ranking</Link></li>
          {/* Platzhalter für später */}
          <li style={{marginTop: 'auto'}}><Link to="/login">Logout</Link></li>
        </ul>
      </nav>

      {/* Der Hauptbereich, wo sich der Inhalt ändert */}
      <main className="content">
        <Outlet /> 
      </main>
    </div>
  );
};

export default Layout;