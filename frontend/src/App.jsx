import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import Home from './features/vault/Home';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Dashboard from './features/vault/Dashboard';
import Settings from './features/security/Settings';
import CustomCursor from './components/CustomCursor';
import { Toaster } from 'react-hot-toast';

import React from 'react';

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
  const { user, loading, masterKey } = useAuth();
  if (loading) return <div className="text-center p-12 text-zinc-500">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!masterKey) {
    return <div className="flex flex-col items-center mt-20 p-4">
      <h2 className="text-2xl text-white mb-4">Vault Locked</h2>
      <p className="text-zinc-400 mb-6 text-center max-w-sm">Your session is active but your master key was lost due to page refresh. Please log in again to unlock your vault.</p>
      <Link to="/login" className="bg-indigo-500 text-white px-6 py-2 rounded-lg">Re-authenticate</Link>
    </div>;
  }
  return children;
}

function MainLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-indigo-500/30">
      <CustomCursor />
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto border-b border-zinc-900/50">
        <Link to="/" className="flex items-center space-x-2">
          <Shield className="w-8 h-8 text-indigo-400" />
          <span className="text-xl font-medium tracking-tight">SecSky</span>
        </Link>
        <div className="space-x-6 text-sm flex items-center">
          {user ? (
            <>
              <Link to="/dashboard" className="text-zinc-300 hover:text-white transition-colors">Dashboard</Link>
              <Link to="/dashboard" className="text-zinc-300 hover:text-white transition-colors">Upload</Link>
              <Link to="/settings" className="text-zinc-300 hover:text-white transition-colors">Settings & Security</Link>
              <button onClick={logout} className="text-zinc-500 hover:text-zinc-300 transition-colors">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-zinc-300 hover:text-white transition-colors">Log In</Link>
              <Link to="/register" className="bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2.5 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
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
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
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
