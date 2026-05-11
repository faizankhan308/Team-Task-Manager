import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Users,
  UserCircle,
  Sun,
  Moon,
  LogOut,
  LayoutGrid,
  Menu,
  X,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './Layout.css';

const navItems = [
  { to: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: 'projects', icon: FolderOpen, label: 'Projects' },
  { to: 'tasks', icon: CheckSquare, label: 'Tasks' },
  { to: 'team', icon: Users, label: 'Team Members' },
  { to: 'profile', icon: UserCircle, label: 'Profile' },
];

function Layout() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="layout-container">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">
            <LayoutGrid size={18} />
          </div>
          <span className="brand-name">TaskManager</span>
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.name || 'User'}</span>
            <span className="sidebar-user-role">{user?.role || 'member'}</span>
          </div>
          <div className="sidebar-actions">
            <button className="icon-btn danger" onClick={handleLogout} title="Logout">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <div className="layout-right">
        <header className="mobile-topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="mobile-brand">
            <div className="brand-logo-sm">
              <LayoutGrid size={15} />
            </div>
            <span>TaskManager</span>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <main className="main-content">
          <Outlet />
        </main>

        <footer className="app-footer">
          <span>Designed &amp; Developed by{' '}
            <a
              href="https://got-theme-portfolio11.onrender.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              Faizan Khan
            </a>
          </span>
        </footer>
      </div>
    </div>
  );
}

export default Layout;
