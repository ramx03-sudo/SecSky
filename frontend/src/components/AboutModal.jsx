import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AboutModal({ isOpen, onClose }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-3xl w-full max-w-sm overflow-hidden relative z-10 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center text-center"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors p-1"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-2xl font-semibold text-white mb-4 tracking-tight">About SecSky</h3>

                        <p className="text-zinc-400 mb-8 leading-relaxed text-sm">
                            SecSky is a zero-knowledge encrypted cloud vault built with a privacy-first architecture.
                        </p>

                        <div className="bg-zinc-950/50 border border-zinc-800/80 p-5 rounded-2xl w-full">
                            <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-2">Engineered by</p>
                            <p className="text-lg font-medium text-zinc-200">Ram Mamillapalli</p>
                            <p className="text-sm text-indigo-400/90 mt-1">Computer Science Student</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
