import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, HardDrive, Key, Smartphone, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import Magnetic from '../../components/Magnetic';

export default function Home() {
    const { user } = useAuth();
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [showSpecs, setShowSpecs] = useState(false);

    const toggleFaq = (index) => {
        if (expandedFaq === index) setExpandedFaq(null);
        else setExpandedFaq(index);
    };

    const faqs = [
        { q: "Can SecSky see my files?", a: "No. Files are encrypted before upload. We never receive plaintext." },
        { q: "What happens if I forget my password?", a: "Your files cannot be recovered. Your password is your only key." },
        { q: "Is encryption performed server-side?", a: "No. All encryption and decryption occur in your browser." },
        { q: "Can I access my files from another device?", a: "Yes. Your master key is derived from your password on each login." },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-200">
            {/* 1. Hero Section */}
            <section className="relative px-6 pt-32 pb-20 md:pt-48 md:pb-32 flex flex-col items-center justify-center text-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] opacity-70 animate-pulse"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
                    <div className="inline-flex items-center space-x-2 bg-zinc-900/80 backdrop-blur border border-zinc-800 text-indigo-400 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        <span>SecSky Architecture</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mb-8 text-white">
                        Encrypted before it <br className="hidden md:block" /> leaves your device.
                    </h1>

                    <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-12 font-light leading-relaxed">
                        Zero-knowledge cloud storage powered by client-side AES-256-GCM encryption. Only you hold the keys.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <Magnetic className="w-full sm:w-auto">
                            <Link to={user ? "/dashboard" : "/register"} className="block w-full sm:w-auto text-center bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-4 rounded-full font-medium shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-colors">
                                {user ? "Go to Dashboard" : "Create Your Vault"}
                            </Link>
                        </Magnetic>
                        <Magnetic className="w-full sm:w-auto">
                            <a href="#how-it-works" className="block w-full sm:w-auto text-center bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-8 py-4 rounded-full font-medium backdrop-blur transition-colors">
                                How It Works
                            </a>
                        </Magnetic>
                    </div>
                </div>
            </section>

            {/* 2. How It Works Section */}
            <section id="how-it-works" className="py-24 px-6 bg-zinc-900/20 border-y border-zinc-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">How SecSky Protects Your Files</h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto">A seamless three-step process ensuring total data sovereignty.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-zinc-950/50 border border-zinc-800/50 p-8 rounded-2xl backdrop-blur-sm flex flex-col items-center text-center">
                            <div className="h-16 w-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
                                <HardDrive className="text-indigo-400 w-8 h-8" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-medium text-white mb-3">Step 1</h3>
                            <p className="text-zinc-400">Select and upload your file directly within your web browser.</p>
                        </div>

                        <div className="bg-zinc-950/50 border border-zinc-800/50 p-8 rounded-2xl backdrop-blur-sm flex flex-col items-center text-center">
                            <div className="h-16 w-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
                                <Lock className="text-indigo-400 w-8 h-8" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-medium text-white mb-3">Step 2</h3>
                            <p className="text-zinc-400">Your browser instantly encrypts it locally with a unique AES-256 key before any upload begins.</p>
                        </div>

                        <div className="bg-zinc-950/50 border border-zinc-800/50 p-8 rounded-2xl backdrop-blur-sm flex flex-col items-center text-center">
                            <div className="h-16 w-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
                                <Shield className="text-indigo-400 w-8 h-8" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-medium text-white mb-3">Step 3</h3>
                            <p className="text-zinc-400">Only encrypted data is stored. Decryption happens exclusively on your device upon download.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Zero-Knowledge Architecture */}
            <section className="py-24 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">True Zero-Knowledge Security</h2>
                        <ul className="space-y-6">
                            {[
                                "Your master key is derived from your password using PBKDF2.",
                                "File encryption keys are wrapped before storage.",
                                "We store only encrypted blobs.",
                                "We cannot decrypt your files.",
                                "If you forget your password, your data cannot be recovered."
                            ].map((text, i) => (
                                <li key={i} className="flex items-start">
                                    <span className="flex-shrink-0 mt-1 mr-4 rounded-full bg-indigo-500/20 p-1">
                                        <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                                    </span>
                                    <span className="text-zinc-300 leading-relaxed">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] rounded-full"></div>
                        <div className="relative bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl backdrop-blur-md">
                            <div className="space-y-4 font-mono text-sm text-zinc-400">
                                <div className="flex justify-between items-center p-3 border border-zinc-800/80 rounded bg-zinc-950/50">
                                    <span>Client Browser</span>
                                    <span className="text-indigo-400">AES-256-GCM Encrypt</span>
                                </div>
                                <div className="flex flex-col items-center text-zinc-600">
                                    <div className="h-4 w-px bg-zinc-700"></div>
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col gap-2 p-4 border border-zinc-800/80 rounded bg-zinc-950/50">
                                    <div className="flex justify-between items-center">
                                        <span>SecSky API</span>
                                        <span className="text-zinc-500">Metadata Storage</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Cloud Storage</span>
                                        <span className="text-zinc-500">Binary Blobs</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Optional File Password Layer & 6. Why SecSky */}
            <section className="py-24 px-6 bg-zinc-900/20 border-y border-zinc-900/50">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">

                    {/* File Password */}
                    <div>
                        <div className="inline-block p-3 bg-zinc-900 rounded-xl border border-zinc-800 mb-6">
                            <Key className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h2 className="text-3xl font-semibold text-white mb-6">Independent File-Level Locking</h2>
                        <p className="text-zinc-400 mb-6 leading-relaxed">
                            Add an additional password per file for maximum protection. File keys are double-wrapped, meaning an account login does not automatically unlock protected files.
                        </p>
                    </div>

                    {/* Why SecSky */}
                    <div>
                        <div className="inline-block p-3 bg-zinc-900 rounded-xl border border-zinc-800 mb-6">
                            <Smartphone className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h2 className="text-3xl font-semibold text-white mb-6">Why SecSky</h2>
                        <ul className="space-y-4">
                            {[
                                "Zero-knowledge architecture",
                                "Client-side encryption",
                                "Multi-device access",
                                "Minimal, distraction-free UI",
                                "Built using modern cryptographic standards"
                            ].map((text, i) => (
                                <li key={i} className="flex items-center text-zinc-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-3"></div>
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </section>

            {/* 5. Security Specifications */}
            <section className="py-24 px-6 max-w-3xl mx-auto w-full">
                <button
                    onClick={() => setShowSpecs(!showSpecs)}
                    className="w-full text-left flex items-center justify-between p-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:bg-zinc-900 transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <Lock className="text-indigo-400 w-5 h-5" />
                        <h2 className="text-xl font-semibold text-white">Security Details</h2>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${showSpecs ? 'rotate-180' : ''}`} />
                </button>

                {showSpecs && (
                    <div className="p-6 border border-t-0 border-zinc-800 rounded-b-2xl bg-zinc-950/50 mt-[-8px] pt-8">
                        <ul className="space-y-4 text-zinc-400 font-mono text-sm">
                            <li className="flex justify-between border-b border-zinc-800/50 pb-2">
                                <span className="text-zinc-300">Encryption Method</span>
                                <span>AES-256-GCM authenticated encryption</span>
                            </li>
                            <li className="flex justify-between border-b border-zinc-800/50 pb-2">
                                <span className="text-zinc-300">Key Derivation</span>
                                <span>PBKDF2 (600k iterations)</span>
                            </li>
                            <li className="flex justify-between border-b border-zinc-800/50 pb-2">
                                <span className="text-zinc-300">Key Generation</span>
                                <span>Unique per-file encryption keys</span>
                            </li>
                            <li className="flex justify-between border-b border-zinc-800/50 pb-2">
                                <span className="text-zinc-300">Server Decryption</span>
                                <span>No server-side decryption possible</span>
                            </li>
                            <li className="flex justify-between border-b border-zinc-800/50 pb-2">
                                <span className="text-zinc-300">Storage</span>
                                <span>No plaintext file storage</span>
                            </li>
                            <li className="flex justify-between pb-2">
                                <span className="text-zinc-300">Authentication</span>
                                <span>HTTP-only JWT</span>
                            </li>
                        </ul>
                    </div>
                )}
            </section>

            {/* 7. FAQ */}
            <section className="py-24 px-6 bg-zinc-900/20 border-t border-zinc-900/50">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-semibold text-white mb-12 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/50">
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full text-left p-5 flex justify-between items-center hover:bg-zinc-900/50 transition-colors"
                                >
                                    <span className="font-medium text-zinc-200">{faq.q}</span>
                                    <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${expandedFaq === index ? 'rotate-180' : ''}`} />
                                </button>
                                {expandedFaq === index && (
                                    <div className="p-5 pt-0 text-zinc-400 leading-relaxed border-t border-zinc-800/50">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 8. Final CTA */}
            <section className="py-32 px-6 text-center border-t border-zinc-900/50 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
                <div className="max-w-3xl mx-auto relative z-10">
                    <h2 className="text-4xl md:text-5xl font-semibold text-white mb-10 tracking-tight">Take Control of Your Data.</h2>
                    <Magnetic className="inline-block">
                        <Link to="/register" className="inline-block bg-indigo-500 hover:bg-indigo-400 text-white px-10 py-5 rounded-full font-medium shadow-[0_0_30px_rgba(99,102,241,0.25)] hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-colors">
                            Create Your Secure Vault
                        </Link>
                    </Magnetic>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-zinc-800/50 bg-zinc-950">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center space-x-2 text-zinc-400">
                        <Shield className="w-5 h-5 text-indigo-500" />
                        <span className="font-medium">SecSky</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-500">
                        <a href="#" className="hover:text-zinc-300 transition-colors">About SecSky</a>
                        <a href="#" className="hover:text-zinc-300 transition-colors">Security</a>
                        <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-zinc-300 transition-colors">Contact</a>
                        <a href="#" className="hover:text-zinc-300 transition-colors">GitHub</a>
                    </div>
                    <div className="text-sm text-zinc-600">
                        &copy; {new Date().getFullYear()} SecSky.
                    </div>
                </div>
            </footer>
        </div>
    );
}
