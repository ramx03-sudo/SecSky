import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getFiles, getRecentActivity } from '../../utils/api';
import { Shield, FileText, HardDrive, Clock, Lock, Activity, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const { user, isVaultUnlocked } = useAuth();
    const [stats, setStats] = useState({ totalFiles: 0, totalSize: 0, lastUpload: null });
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const [files, recentLogs] = await Promise.all([
                    getFiles(),
                    getRecentActivity()
                ]);

                const totalSize = files.reduce((acc, f) => acc + (f.file_size || 0), 0);

                // Find latest upload time from files
                const uploads = files.filter(f => f.created_at).map(f => new Date(f.created_at));
                let lastUpload = uploads.length > 0 ? new Date(Math.max(...uploads)) : null;

                setStats({
                    totalFiles: files.length,
                    totalSize,
                    lastUpload
                });

                setActivity(recentLogs || []);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        }
        fetchDashboardData();
    }, []);

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const timeAgo = (date) => {
        if (!date) return 'Never';
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'UPLOAD': return <Zap className="w-4 h-4 text-emerald-400" />;
            case 'DELETE': return <Activity className="w-4 h-4 text-red-500" />;
            case 'MOVE': return <ChevronRight className="w-4 h-4 text-amber-500" />;
            default: return <FileText className="w-4 h-4 text-indigo-400" />;
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'UPLOAD': return 'bg-emerald-500/10 border-emerald-500/20';
            case 'DELETE': return 'bg-red-500/10 border-red-500/20';
            default: return 'bg-indigo-500/10 border-indigo-500/20';
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-8 py-10 min-h-[85vh] flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <Shield className="w-12 h-12 text-indigo-500/50 mb-4" />
                    <div className="h-4 w-32 bg-zinc-800 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-8 py-10 min-h-[85vh]">
            <div className="mb-10">
                <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
                    Welcome back, <span className="text-zinc-400 font-normal">{user.email.split('@')[0]}</span>
                </h1>
                <p className="text-zinc-500">Secure. Private. End-to-End Encrypted.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 transition-colors hover:border-indigo-500/30">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-500/10 rounded-xl">
                            <FileText className="w-5 h-5 text-indigo-400" />
                        </div>
                    </div>
                    <div>
                        <p className="text-zinc-500 text-sm font-medium mb-1">Total Files</p>
                        <p className="text-3xl font-semibold text-white tracking-tight">{stats.totalFiles}</p>
                    </div>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 transition-colors hover:border-emerald-500/30">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <HardDrive className="w-5 h-5 text-emerald-400" />
                        </div>
                    </div>
                    <div>
                        <p className="text-zinc-500 text-sm font-medium mb-1">Encrypted Data</p>
                        <p className="text-3xl font-semibold text-white tracking-tight">{formatBytes(stats.totalSize)}</p>
                    </div>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 transition-colors hover:border-amber-500/30">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl">
                            <Clock className="w-5 h-5 text-amber-400" />
                        </div>
                    </div>
                    <div>
                        <p className="text-zinc-500 text-sm font-medium mb-1">Last Upload</p>
                        <p className="text-xl font-semibold text-white tracking-tight truncate" title={timeAgo(stats.lastUpload)}>
                            {timeAgo(stats.lastUpload)}
                        </p>
                    </div>
                </div>

                <div className={`bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 transition-colors ${isVaultUnlocked ? 'hover:border-emerald-500/30' : 'hover:border-red-500/30'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${isVaultUnlocked ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                            {isVaultUnlocked ? <Shield className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5 text-red-500" />}
                        </div>
                        <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${isVaultUnlocked ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>
                            {isVaultUnlocked ? 'Active' : 'Locked'}
                        </div>
                    </div>
                    <div>
                        <p className="text-zinc-500 text-sm font-medium mb-1">Vault Status</p>
                        <p className="text-2xl font-semibold text-white tracking-tight">
                            {isVaultUnlocked ? 'Unlocked' : 'Encrypted'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Feed */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-zinc-500" />
                        Recent Activity
                    </h3>

                    {activity.length === 0 ? (
                        <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-2xl p-8 text-center">
                            <Activity className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
                            <p className="text-zinc-400 font-medium">No recent activity.</p>
                            <p className="text-zinc-600 text-sm mt-1">Your vault is completely empty.</p>
                        </div>
                    ) : (
                        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden">
                            <div className="divide-y divide-zinc-800/50">
                                {activity.map((log) => (
                                    <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-zinc-900/60 transition-colors">
                                        <div className={`flex-shrink-0 mt-1 p-2 rounded-lg border ${getActivityColor(log.type)}`}>
                                            {getActivityIcon(log.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-zinc-200">
                                                {log.type === 'UPLOAD' ? 'Encrypted & Uploaded text' : log.type === 'DELETE' ? 'Securely Deleted' : 'Moved'}
                                                <span className="text-indigo-400 ml-1">file</span>
                                                {log.password_added && <Lock className="inline w-3 h-3 text-amber-500 ml-2" title="Password Protected" />}
                                            </p>
                                            <p className="text-xs text-zinc-500 mt-1">{timeAgo(log.timestamp)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Branding Block */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Shield className="w-32 h-32" />
                        </div>
                        <h3 className="text-xl font-semibold text-white tracking-tight mb-2">SecSky Architecture</h3>
                        <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                            Zero-knowledge encrypted storage. Built with purely local AES-256 GCM cryptographic routines. Your master key never touches our servers.
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center text-xs font-medium text-zinc-300">
                                <CheckCircle2 className="w-4 h-4 text-indigo-400 mr-2" />
                                End-to-End Encrypted
                            </div>
                            <div className="flex items-center text-xs font-medium text-zinc-300">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2" />
                                Post-Quantum Prepared
                            </div>
                            <div className="flex items-center text-xs font-medium text-zinc-300">
                                <CheckCircle2 className="w-4 h-4 text-amber-400 mr-2" />
                                Strict Security Headers
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-indigo-500/20">
                            <p className="text-[11px] font-mono text-indigo-400/80 uppercase tracking-wider">
                                Designed & Engineered by
                            </p>
                            <p className="text-sm font-medium text-white mt-1">Ram Mamillapalli</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
