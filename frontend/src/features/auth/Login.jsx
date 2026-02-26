import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Loader2, Lock, Unlock, ArrowRight, ArrowLeft } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Login() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [masterPassword, setMasterPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, unlockVault } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(email, loginPassword);
            setStep(2);
            toast.success("Authentication successful. Waiting for Master Password.");
        } catch (err) {
            toast.error(err.message || 'Failed to login');
        }
        setIsLoading(false);
    };

    const handleUnlock = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await unlockVault(masterPassword);
            toast.success("Vault Unlocked!");
            navigate('/files');
        } catch (err) {
            toast.error(err.message || 'Failed to unlock vault');
        }
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 p-8 rounded-3xl shadow-2xl relative overflow-hidden"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 border border-indigo-500/20">
                        {step === 1 ? <Lock className="w-6 h-6 text-indigo-400" /> : <Unlock className="w-6 h-6 text-indigo-400" />}
                    </div>
                    <h2 className="text-2xl font-semibold text-white tracking-tight">
                        {step === 1 ? 'Access your Vault' : 'Unlock your Vault'}
                    </h2>
                    <p className="text-zinc-400 text-sm mt-2 text-center">
                        {step === 1 ? 'Enter your login credentials' : 'Enter your Master Password to decrypt keys'}
                    </p>
                </div>

                <div className="relative">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.form
                                key="step1"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                onSubmit={handleLogin}
                                className="space-y-5"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1">Login Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center space-x-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <><span>Log In</span> <ArrowRight className="w-4 h-4" /></>
                                    )}
                                </button>
                            </motion.form>
                        )}

                        {step === 2 && (
                            <motion.form
                                key="step2"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 20, opacity: 0 }}
                                onSubmit={handleUnlock}
                                className="space-y-5"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1.5 ml-1">Master Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={masterPassword}
                                        onChange={(e) => setMasterPassword(e.target.value)}
                                        autoFocus
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                        placeholder="••••••••••••"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="w-1/3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-2/3 bg-indigo-500 hover:bg-indigo-400 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Unlock</span>}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                <p className="text-zinc-500 text-sm text-center mt-8">
                    Don't have an account? <Link to="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">Create one</Link>
                </p>
            </motion.div>
        </div>
    );
}
