import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Shield, Key, Trash, AlertTriangle, X, Loader2, CheckCircle2 } from 'lucide-react';
import { changeLoginPassword, changeMasterPassword, getFiles } from '../../utils/api';
import { deriveMasterKey, decryptString } from '../../utils/crypto';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Settings() {
    const { user, masterKey, userSalt, logout } = useAuth();

    // Login Password State
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [oldLoginPassword, setOldLoginPassword] = useState('');
    const [newLoginPassword, setNewLoginPassword] = useState('');
    const [isChangingLogin, setIsChangingLogin] = useState(false);

    // Master Password State
    const [showMasterModal, setShowMasterModal] = useState(false);
    const [oldMasterPassword, setOldMasterPassword] = useState('');
    const [newMasterPassword, setNewMasterPassword] = useState('');
    const [isChangingMaster, setIsChangingMaster] = useState(false);

    const handleLoginPasswordSubmit = async (e) => {
        e.preventDefault();
        if (newLoginPassword.length < 8) return toast.error("New password must be at least 8 characters");

        setIsChangingLogin(true);
        try {
            await changeLoginPassword({ old_password: oldLoginPassword, new_password: newLoginPassword });
            toast.success("Login password updated successfully!");
            setShowLoginModal(false);
            setOldLoginPassword('');
            setNewLoginPassword('');
        } catch (err) {
            toast.error(err.message || "Failed to change login password");
        } finally {
            setIsChangingLogin(false);
        }
    };

    const handleMasterPasswordSubmit = async (e) => {
        e.preventDefault();
        if (newMasterPassword.length < 8) return toast.error("New master password must be at least 8 characters");
        if (!masterKey) return toast.error("Vault is not unlocked.");

        setIsChangingMaster(true);
        const loadingToast = toast.loading("Re-encrypting vault items...");
        try {
            // 1. Verify old master password matches the active session
            const { masterKey: testOldKey } = await deriveMasterKey(oldMasterPassword, userSalt);
            // Quick check: attempt to export both and compare
            const e1 = await crypto.subtle.exportKey("raw", masterKey);
            const e2 = await crypto.subtle.exportKey("raw", testOldKey);
            if (btoa(String.fromCharCode(...new Uint8Array(e1))) !== btoa(String.fromCharCode(...new Uint8Array(e2)))) {
                throw new Error("Incorrect current master password.");
            }

            // 2. Fetch all files
            const files = await getFiles();

            if (files.some(f => f.password_protected)) {
                throw new Error("Cannot change master password while you have files with secondary passwords. Please delete them first.");
            }

            // 3. Generate new salt and master key
            const saltBytes = crypto.getRandomValues(new Uint8Array(16));
            const saltString = btoa(String.fromCharCode(...saltBytes));
            const { masterKey: newMKey } = await deriveMasterKey(newMasterPassword, saltString);

            // 4. Create new vault metadata
            const enc = new TextEncoder();
            const rootIv = crypto.getRandomValues(new Uint8Array(12));
            const encMeta = await crypto.subtle.encrypt({ name: "AES-GCM", iv: rootIv }, newMKey, enc.encode("SECURE_VAULT"));
            const newVaultMetadata = JSON.stringify({
                data: btoa(String.fromCharCode(...new Uint8Array(encMeta))),
                iv: btoa(String.fromCharCode(...rootIv))
            });

            // 5. Update all file wrappers
            const file_updates = [];
            for (let f of files) {
                // Decrypt old filename
                const filename = await decryptString(f.filename, f.filename_iv, masterKey);

                // Re-encrypt filename
                const newFilenameIv = crypto.getRandomValues(new Uint8Array(12));
                const encryptedFilenameBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv: newFilenameIv }, newMKey, enc.encode(filename));

                // Unwrap fileKey
                const wrappedKeyBuffer = Uint8Array.from(atob(f.encrypted_file_key), c => c.charCodeAt(0));
                const wrapIv = Uint8Array.from(atob(f.key_wrap_iv), c => c.charCodeAt(0));
                const fileKey = await crypto.subtle.unwrapKey(
                    "raw", wrappedKeyBuffer, masterKey, { name: "AES-GCM", iv: wrapIv }, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]
                );

                // Rewrap with new masterKey
                const newWrapIv = crypto.getRandomValues(new Uint8Array(12));
                const newWrappedKeyBuffer = await crypto.subtle.wrapKey(
                    "raw", fileKey, newMKey, { name: "AES-GCM", iv: newWrapIv }
                );

                file_updates.push({
                    file_id: f.id,
                    encrypted_file_key: btoa(String.fromCharCode(...new Uint8Array(newWrappedKeyBuffer))),
                    key_wrap_iv: btoa(String.fromCharCode(...newWrapIv)),
                    encrypted_filename: btoa(String.fromCharCode(...new Uint8Array(encryptedFilenameBuffer))),
                    filename_iv: btoa(String.fromCharCode(...newFilenameIv))
                });
            }

            // 6. Push to server
            await changeMasterPassword({ salt: saltString, vault_metadata: newVaultMetadata, file_updates });
            toast.success("Master password updated! Please log in again.", { id: loadingToast });
            setShowMasterModal(false);
            setTimeout(() => logout(), 1500);

        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to change master password", { id: loadingToast });
        } finally {
            setIsChangingMaster(false);
        }
    };


    return (
        <div className="max-w-4xl mx-auto px-8 py-10 min-h-[85vh]">
            <h1 className="text-3xl font-semibold text-white tracking-tight mb-8">Security & Settings</h1>

            <div className="space-y-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6">
                    <h2 className="text-xl font-medium text-white flex items-center mb-4">
                        <Shield className="w-5 h-5 text-indigo-400 mr-2" />
                        Account Details
                    </h2>
                    <div className="text-zinc-400 space-y-2 text-sm">
                        <p><span className="text-zinc-500 w-24 inline-block">Email</span> <span className="text-zinc-200">{user?.email}</span></p>
                        <p><span className="text-zinc-500 w-24 inline-block">Account ID</span> <span className="font-mono text-xs">{user?.id}</span></p>
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6">
                    <h2 className="text-xl font-medium text-white flex items-center mb-4">
                        <Key className="w-5 h-5 text-amber-500 mr-2" />
                        Vault Security
                    </h2>
                    <div className="text-zinc-400 text-sm space-y-4">
                        <div className="flex justify-between items-center border border-zinc-800 p-4 rounded-xl">
                            <div>
                                <p className="text-zinc-200 font-medium">Encryption Strength</p>
                                <p className="text-xs">End-to-End AES-256-GCM. 200,000 PBKDF2 iterations.</p>
                            </div>
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold">Maximum</span>
                        </div>

                        <div className="flex justify-between items-center border border-zinc-800 p-4 rounded-xl">
                            <div>
                                <p className="text-zinc-200 font-medium">Change Login Password</p>
                                <p className="text-xs">Update your authentication credentials.</p>
                            </div>
                            <button onClick={() => setShowLoginModal(true)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors shadow">Update</button>
                        </div>

                        <div className="flex justify-between items-center border border-zinc-800 p-4 rounded-xl">
                            <div>
                                <p className="text-zinc-200 font-medium">Change Master Password</p>
                                <p className="text-xs">Warning: This will thoroughly re-encrypt all vault items in memory.</p>
                            </div>
                            <button onClick={() => setShowMasterModal(true)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors shadow">Update</button>
                        </div>
                    </div>
                </div>

                <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6">
                    <h2 className="text-xl font-medium text-red-400 flex items-center mb-2">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Danger Zone
                    </h2>
                    <p className="text-zinc-500 text-sm mb-4">Once you delete your account, there is no going back. Please be certain.</p>

                    <button className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/50 px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg flex items-center">
                        <Trash className="w-4 h-4 mr-2" /> Delete Account
                    </button>
                </div>
            </div>

            {/* Login Password Modal */}
            <AnimatePresence>
                {showLoginModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isChangingLogin && setShowLoginModal(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden relative z-10 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-medium text-white">Change Login Password</h3>
                                <button onClick={() => setShowLoginModal(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            <form onSubmit={handleLoginPasswordSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Current Password</label>
                                    <input type="password" required value={oldLoginPassword} onChange={e => setOldLoginPassword(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">New Password</label>
                                    <input type="password" required minLength={8} value={newLoginPassword} onChange={e => setNewLoginPassword(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                                </div>
                                <button type="submit" disabled={isChangingLogin} className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-3 rounded-xl font-medium transition-colors flex justify-center mt-2 disabled:opacity-50">
                                    {isChangingLogin ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Login Password"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Master Password Modal */}
            <AnimatePresence>
                {showMasterModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isChangingMaster && setShowMasterModal(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden relative z-10 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-medium text-amber-500 flex items-center"><Key className="w-5 h-5 mr-2" />Change Master Password</h3>
                                <button onClick={() => setShowMasterModal(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl mb-6">
                                <p className="text-amber-400/90 text-sm">This action will systematically decrypt & re-encode all files in memory. Ensure you have a stable connection.</p>
                            </div>
                            <form onSubmit={handleMasterPasswordSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Current Master Password</label>
                                    <input type="password" required value={oldMasterPassword} onChange={e => setOldMasterPassword(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">New Master Password</label>
                                    <input type="password" required minLength={8} value={newMasterPassword} onChange={e => setNewMasterPassword(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors" />
                                </div>
                                <button type="submit" disabled={isChangingMaster} className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-900 py-3 rounded-xl font-bold transition-colors flex justify-center mt-2 disabled:opacity-50">
                                    {isChangingMaster ? <Loader2 className="w-5 h-5 animate-spin" /> : "Re-encrypt Vault"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
