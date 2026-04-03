import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/useAuth';
import './Layout.css';

const Layout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault(); // Verhindert normales Link-Verhalten
    logout();
    navigate('/login');
  };

  return (
    <div className="layout-container">
      {/* Die Seitenleiste */}
      <nav className="sidebar">
        <div className="logo">🌿 Feels Like Organic</div>
        <ul className="nav-links">
          <li><Link to="/">🏠 Dashboard</Link></li>
          <li><Link to="/training">🏃 Mein Training</Link></li>
          <li><Link to="/ranking">🏆 Ranking</Link></li>
          {user?.role === 'trainer' && <li><Link to="/admin">👥 Athletenverwaltung</Link></li>}
           
          {/* Logout Button */}
          <li style={{marginTop: 'auto'}}>
            <a href="/login" onClick={handleLogout}>🚪 Logout</a>
          </li>
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