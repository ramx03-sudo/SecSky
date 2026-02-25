import React, { useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { Lock, Loader2, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function MasterPasswordModal() {
    const { user, isVaultUnlocked, unlockVault } = useAuth();
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Only show if logged in but vault is locked
    const isOpen = user && !isVaultUnlocked;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await unlockVault(password);
            toast.success("Vault Unlocked!");
            setPassword('');
        } catch (err) {
            toast.error(err.message || 'Failed to unlock vault');
        }
        setIsLoading(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden relative z-10 p-8 shadow-2xl"
                    >
                        <div className="flex flex-col items-center mb-8 text-center">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 border border-indigo-500/20">
                                <Lock className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h3 className="text-2xl font-semibold text-white tracking-tight">Vault Locked</h3>
                            <p className="text-zinc-400 text-sm mt-2">
                                Re-enter your master password to unlock your vault.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Key className="h-5 w-5 text-zinc-500" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoFocus
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                        placeholder="Master Password"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Unlock Vault</span>}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
