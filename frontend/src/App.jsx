import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OnboardingProvider, useOnboarding } from './context/OnboardingContext';
import AuthPages    from './pages/AuthPages';
import Dashboard    from './pages/Dashboard';
import OnboardingPage from './pages/OnboardingPage';
import MyPlanPage   from './pages/MyPlanPage';
import ChatPage     from './pages/ChatPage';
import ProfilePage  from './pages/ProfilePage';
import Layout       from './components/Layout';

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div style={{ width:52,height:52,background:'var(--primary)',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12,boxShadow:'0 8px 24px rgba(22,163,74,.25)' }}>
        <span style={{ fontSize:26 }}>💪</span>
      </div>
      <div className="spinner" />
    </div>
  );
}

// Gate: auth required
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" />;
};

// Gate: if onboarding not done, redirect to onboarding
const OnboardingGate = ({ children }) => {
  const { state } = useOnboarding();
  if (!state) return <LoadingScreen />;
  if (!state.onboardingComplete) return <Navigate to="/onboarding" />;
  return children;
};

// Wrap all private routes with both auth + onboarding context
function PrivateLayout({ children }) {
  const { user } = useAuth();
  return (
    <OnboardingProvider userId={user?.id || user?.email}>
      {children}
    </OnboardingProvider>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login"    element={<AuthPages />} />
        <Route path="/register" element={<AuthPages isRegister />} />
        <Route path="*"         element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <PrivateLayout>
      <OnboardingProvider userId={user?.id || user?.email}>
        <InnerRoutes />
      </OnboardingProvider>
    </PrivateLayout>
  );
}

function InnerRoutes() {
  const { user } = useAuth();
  const { state } = useOnboarding();

  if (!state) return <LoadingScreen />;

  // First-time user → onboarding (full page, no sidebar)
  if (!state.onboardingComplete) {
    return (
      <Routes>
        <Route path="*" element={<OnboardingPage />} />
      </Routes>
    );
  }

  // Regular app routes with sidebar
  return (
    <Routes>
      <Route path="/"        element={<Layout><Dashboard /></Layout>} />
      <Route path="/plan"    element={<Layout><MyPlanPage /></Layout>} />
      <Route path="/plans"   element={<Navigate to="/plan" />} />
      <Route path="/generate" element={<Navigate to="/" />} />
      <Route path="/chat"    element={<Layout><ChatPage /></Layout>} />
      <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
      <Route path="*"        element={<Navigate to="/" />} />
    </Routes>
  );
}

// Root: wrap with auth, then route
function AppWithAuth() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;

  if (!user) {
    return (
      <Routes>
        <Route path="/login"    element={<AuthPages />} />
        <Route path="/register" element={<AuthPages isRegister />} />
        <Route path="*"         element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <OnboardingProvider userId={user?.id || user?.email}>
      <InnerRoutes />
    </OnboardingProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppWithAuth />
      </Router>
    </AuthProvider>
  );
}
