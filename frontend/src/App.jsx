import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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

function NavItem({ to, children }) {
  return (
    <NavLink to={to} className={({ isActive }) => `relative px-3 py-1.5 transition-colors font-medium text-[15px] ${isActive ? 'text-white' : 'text-[#A0A6C3] hover:text-[#E6E9F2]'}`}>
      {({ isActive }) => (
        <>
          <span className="relative z-10">{children}</span>
          {isActive && (
            <motion.div
              layoutId="navTab"
              className="absolute inset-0 bg-indigo-500/20 border border-indigo-500/30 rounded-lg"
              initial={false}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

function MainLayout() {
  const { user, logout } = useAuth();
  const [showAbout, setShowAbout] = useState(false);

  useVaultInactivity();

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-indigo-500/30">
      <CustomCursor />
      <nav className="h-[80px] flex items-center justify-between w-full px-[60px] max-w-[1200px] mx-auto z-50 relative">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-medium tracking-tight text-[#E6E9F2]">SecSky</span>
        </Link>
        <div className="flex items-center gap-2 md:gap-4 lg:gap-6 text-[15px] font-medium text-[#A0A6C3]">
          {!user ? (
            <>
              <button onClick={() => setShowAbout(true)} className="hover:text-[#E6E9F2] transition-colors px-3 py-1.5">Product</button>
              <button onClick={() => setShowAbout(true)} className="hover:text-[#E6E9F2] transition-colors px-3 py-1.5">Security</button>
              <button onClick={() => setShowAbout(true)} className="hover:text-[#E6E9F2] transition-colors px-3 py-1.5">Docs</button>
              <div className="w-px h-4 bg-[rgba(255,255,255,0.1)] mx-2 hidden sm:block"></div>
              <Link to="/login" className="hover:text-[#E6E9F2] transition-colors px-3 py-1.5">Log In</Link>
              <Link to="/register" className="btn-primary py-2 px-5 ml-2">Sign Up</Link>
            </>
          ) : (
            <>
              <NavItem to="/files">Files</NavItem>
              <NavItem to="/dashboard">Dashboard</NavItem>
              <NavItem to="/settings">Security</NavItem>
              <div className="w-px h-4 bg-[rgba(255,255,255,0.1)] mx-2 hidden sm:block"></div>
              <button onClick={logout} className="hover:text-[#E6E9F2] transition-colors px-3 py-1.5">Logout</button>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1">
        <AnimatedRoutes />
      </main>

      {/* Global Footer */}
      <footer className="mt-auto border-t border-[rgba(255,255,255,0.06)] bg-[#05060F]">
        <div className="max-w-[1200px] mx-auto px-[60px] py-[60px] flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="text-[#E6E9F2] font-semibold text-[20px] mb-2">
              SecSky
            </div>
            <div className="text-[#A0A6C3] text-[14px]">
              Designed & Engineered by <span className="text-[#E6E9F2]">Ram Mamillapalli</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-[14px] text-[#A0A6C3]">
            <a href="#" className="hover:text-[#E6E9F2] transition-colors">Docs</a>
            <a href="#" className="hover:text-[#E6E9F2] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#E6E9F2] transition-colors w-max">Security Whitepaper</a>
            <a href="#" className="hover:text-[#E6E9F2] transition-colors">Terms</a>
          </div>
        </div>
        <div className="border-t border-[rgba(255,255,255,0.03)] flex justify-center py-[24px]">
          <p className="text-[#A0A6C3] text-[13px]">
            &copy; {new Date().getFullYear()} SecSky. All rights reserved.
          </p>
        </div>
      </footer>

      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </div >
  );
}

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.99 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/dashboard" element={<PrivateRoute><PageTransition><Dashboard /></PageTransition></PrivateRoute>} />
        <Route path="/files" element={<PrivateRoute><PageTransition><Files /></PageTransition></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><PageTransition><Settings /></PageTransition></PrivateRoute>} />
      </Routes>
    </AnimatePresence>
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
