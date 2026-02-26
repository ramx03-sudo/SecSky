import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Shield, Github } from 'lucide-react';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import Home from './features/vault/Home';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Dashboard from './features/vault/Dashboard';
import Files from './features/vault/Files';
import Settings from './features/security/Settings';
import CustomCursor from './components/CustomCursor';
import AboutModal from './components/AboutModal';
import MasterPasswordModal from './components/MasterPasswordModal';
import { Toaster } from 'react-hot-toast';
import { useVaultInactivity } from './hooks/useVaultInactivity';

import React, { useState } from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-4 text-center">
          <h1 className="text-3xl mb-4 text-red-400">Something went wrong.</h1>
          <p className="text-zinc-400 mb-6">An unexpected UI error occurred. Please refresh the page.</p>
          <button onClick={() => window.location.reload()} className="bg-indigo-500 px-6 py-2 rounded-xl">Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function PrivateRoute({ children }) {
  const { user, loading, isVaultUnlocked } = useAuth();
  if (loading) return <div className="text-center p-12 text-zinc-500">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!isVaultUnlocked) return <MasterPasswordModal />;
  return children;
}

function MainLayout() {
  const { user, logout } = useAuth();
  const [showAbout, setShowAbout] = useState(false);

  useVaultInactivity();

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-indigo-500/30">
      <CustomCursor />
      <nav className="h-[80px] flex items-center justify-between w-full px-[60px] max-w-[1200px] mx-auto">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-medium tracking-tight text-[#E6E9F2]">SecSky</span>
        </Link>
        <div className="flex items-center gap-6 text-[15px] font-medium text-[#A0A6C3]">
          {!user ? (
            <>
              <button onClick={() => setShowAbout(true)} className="hover:text-[#E6E9F2] transition-colors">Product</button>
              <button onClick={() => setShowAbout(true)} className="hover:text-[#E6E9F2] transition-colors">Security</button>
              <button onClick={() => setShowAbout(true)} className="hover:text-[#E6E9F2] transition-colors">Docs</button>
              <div className="w-px h-4 bg-[rgba(255,255,255,0.1)] mx-2"></div>
              <Link to="/login" className="hover:text-[#E6E9F2] transition-colors">Log In</Link>
              <Link to="/register" className="btn-primary py-2.5 px-6">Sign Up</Link>
            </>
          ) : (
            <>
              <Link to="/files" className="hover:text-[#E6E9F2] transition-colors">Files</Link>
              <Link to="/dashboard" className="hover:text-[#E6E9F2] transition-colors">Dashboard</Link>
              <Link to="/settings" className="hover:text-[#E6E9F2] transition-colors">Security</Link>
              <div className="w-px h-4 bg-[rgba(255,255,255,0.1)] mx-2"></div>
              <button onClick={logout} className="hover:text-[#E6E9F2] transition-colors">Logout</button>
            </>
          )}
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/files" element={<PrivateRoute><Files /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        </Routes>
      </main>

      {/* Global Footer */}
      <footer className="mt-auto border-t border-[rgba(255,255,255,0.06)] bg-[#05060F]">
        <div className="max-w-[1200px] mx-auto px-[60px] py-[40px] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[#E6E9F2] font-medium">
            SecSky
          </div>
          <div className="flex items-center gap-6 text-sm text-[#A0A6C3]">
            <a href="#" className="hover:text-[#E6E9F2] transition-colors">Docs</a>
            <a href="#" className="hover:text-[#E6E9F2] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#E6E9F2] transition-colors">Terms</a>
          </div>
        </div>
        <div className="border-t border-[rgba(255,255,255,0.03)] flex justify-center py-[24px]">
          <p className="text-[#A0A6C3] text-sm">
            &copy; 2026 SecSky. Engineered by Ram Mamillapalli.
          </p>
        </div>
      </footer>

      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </div >
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Toaster position="bottom-right" toastOptions={{
            style: {
              background: '#18181b',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)'
            }
          }} />
          <MainLayout />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
