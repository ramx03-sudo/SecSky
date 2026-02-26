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
      <nav className="flex items-center justify-between w-full px-8 py-6 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center space-x-2">
          <Shield className="w-8 h-8 text-indigo-400" />
          <span className="text-xl font-medium tracking-tight">SecSky</span>
        </Link>
        <div className="space-x-6 text-sm flex items-center">
          <button onClick={() => setShowAbout(true)} className="text-zinc-400 hover:text-white transition-colors font-medium">About</button>
          <a href="https://github.com/ramx03-sudo" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-indigo-400 transition-colors" title="GitHub">
            <Github className="w-5 h-5" />
          </a>
          {user ? (
            <>
              <Link to="/files" className="text-zinc-300 hover:text-white transition-colors">Files</Link>
              <Link to="/dashboard" className="text-zinc-300 hover:text-white transition-colors">Dashboard</Link>
              <Link to="/settings" className="text-zinc-300 hover:text-white transition-colors">Settings & Security</Link>
              <button onClick={logout} className="text-zinc-500 hover:text-zinc-300 transition-colors">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-zinc-300 hover:text-white transition-colors">Log In</Link>
              <Link to="/register" className="btn-primary">
                Create Vault
              </Link>
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
      <footer className="mt-auto py-8 text-center bg-zinc-900/10 backdrop-blur-md rounded-t-3xl border-t border-indigo-500/10 max-w-7xl mx-auto w-full">
        <p className="text-zinc-500 text-sm">
          &copy; {new Date().getFullYear()} SecSky. Engineered by <span className="text-indigo-400/80 font-medium">Ram Mamillapalli</span>.
        </p>
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
