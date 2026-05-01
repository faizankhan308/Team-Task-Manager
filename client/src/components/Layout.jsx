import { FolderKanban, LayoutDashboard, ListTodo, LogOut, Search, User, ChevronLeft, ChevronRight, Menu, Moon, Sun } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';

import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Button } from './Button.jsx';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/tasks', label: 'Task Board', icon: ListTodo }
];

const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentLabel = links.find(l => l.to === location.pathname)?.label || 'Workspace';

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      {/* Sleek Sidebar with Toggle */}
      <aside 
        className={`flex flex-col border-r border-border bg-surface transition-all duration-300 z-20 ${
          isCollapsed ? 'w-16' : 'w-64 hidden lg:flex'
        } ${!isCollapsed && 'absolute lg:relative h-full'}`}
      >
        <div className={`h-14 flex items-center border-b border-border ${isCollapsed ? 'justify-center' : 'justify-start px-4 gap-2'}`}>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center h-8 w-8 rounded-md text-foreground-muted hover:bg-surface-hover hover:text-foreground transition-colors shrink-0"
          >
            <Menu size={18} />
          </button>
          
          {!isCollapsed && (
            <div className="flex items-center gap-2 overflow-hidden ml-1">
              <div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                T
              </div>
              <span className="font-semibold tracking-tight whitespace-nowrap">Team Task</span>
            </div>
          )}
        </div>
        
        <nav className="flex-1 py-6 flex flex-col gap-1 px-3 overflow-y-auto overflow-x-hidden hide-scrollbar">
          {!isCollapsed && <div className="px-3 mb-2 text-xs font-semibold text-foreground-muted tracking-wider uppercase">Menu</div>}
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={isCollapsed ? label : ''}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-surface-hover text-foreground' 
                    : 'text-foreground-muted hover:bg-surface-hover/50 hover:text-foreground'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
            >
              <Icon size={18} className="shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Persistent Bottom User / Logout Section */}
        <div className="p-3 border-t border-border flex flex-col gap-2 bg-surface">
          <button 
            onClick={logout} 
            title={isCollapsed ? "Log out" : ""}
            className={`group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground-muted hover:bg-danger/10 hover:text-danger transition-colors w-full ${isCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={18} className="shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">Log out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Breadcrumb & Actions Bar */}
        <header className="h-14 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-background/95 backdrop-blur z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden text-foreground-muted hover:text-foreground"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 text-sm text-foreground-muted">
              <span className="hidden sm:inline">Workspace</span>
              <span className="hidden sm:inline text-border-strong">/</span>
              <span className="text-foreground font-medium">{currentLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface border border-border text-xs text-foreground-muted">
              <Search size={14} />
              <span className="w-32">Search...</span>
              <kbd className="ml-2 font-mono text-[10px] bg-background px-1 rounded border border-border">⌘K</kbd>
            </div>
            
            <div className="flex items-center gap-3 border-l border-border pl-4">
              <button 
                onClick={toggleTheme}
                className="h-8 w-8 rounded-md hover:bg-surface-hover flex items-center justify-center text-foreground-muted hover:text-foreground transition-colors mr-2"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              <div className="flex flex-col items-end">
                <span className="text-xs font-medium text-foreground">{user?.name}</span>
                <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-widest">{user?.role}</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-surface-hover border border-border flex items-center justify-center shrink-0">
                <User size={14} className="text-foreground-muted" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
        
        {/* Fixed Footer (Aligned horizontally with sidebar logout) */}
        <footer className="shrink-0 border-t border-border p-3 bg-surface flex flex-col justify-center items-center gap-1.5 z-10">
          <div className="flex gap-6 font-medium text-xs text-foreground-muted">
            <a href="#" className="hover:text-foreground transition-colors">About</a>
            <a href="#" className="hover:text-foreground transition-colors">Help</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          </div>
          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-foreground-muted">
            <div className="h-4 w-4 rounded bg-border-strong text-[8px] flex items-center justify-center text-foreground font-bold shrink-0">T</div>
            <span>&copy; {new Date().getFullYear()} Team Task Manager. All rights reserved.</span>
          </div>
        </footer>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-10 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </div>
  );
};

export default Layout;
