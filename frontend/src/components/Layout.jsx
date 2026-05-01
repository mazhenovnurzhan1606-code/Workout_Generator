import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import {
  LayoutDashboard, ClipboardList, MessageSquare, User, LogOut, Dumbbell
} from 'lucide-react';

// "Generate Plan" is REMOVED from nav once onboarding is complete
const BASE_NAV = [
  { path: '/',       icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/plan',   icon: ClipboardList,   label: 'My Plan' },
  { path: '/chat',   icon: MessageSquare,   label: 'AI Assistant' },
  { path: '/profile', icon: User,           label: 'Profile' },
];

export default function Layout({ children }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();
  const { state } = useOnboarding();

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  // Show "Generate Plan" only before onboarding is complete
  const navItems = state?.onboardingComplete
    ? BASE_NAV
    : [{ path: '/generate', icon: Dumbbell, label: 'Setup Plan' }, ...BASE_NAV];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark"><Dumbbell size={18} /></div>
          <span className="logo-text">Fit<span>AI</span></span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu</div>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path ||
              (item.path === '/plan' && location.pathname === '/plans');
            return (
              <button
                key={item.path}
                className={`nav-item ${active ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <button className="nav-item" onClick={logout} style={{ color: 'var(--danger)' }}>
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
