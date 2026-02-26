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
        <div className="flex flex-col min-h-screen relative overflow-hidden">
            <div className="glow-dot" style={{ top: '-10%', right: '-5%' }}></div>
            <div className="glow-dot" style={{ bottom: '10%', left: '-10%' }}></div>
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

                    <h1 className="hero-title mb-6">
                        Encrypted before it <br className="hidden md:block" /> leaves your device.
                    </h1>

                    <p className="secondary-text hero-sub mb-12">
                        Zero-knowledge cloud storage powered by client-side AES-256-GCM encryption. Only you hold the keys.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
                        <Magnetic className="w-full sm:w-auto">
                            <Link to={user ? "/files" : "/register"} className="block w-full sm:w-auto text-center btn-primary px-8 py-4">
                                {user ? "Go to Files" : "Create Your Vault"}
                            </Link>
                        </Magnetic>
                        <Magnetic className="w-full sm:w-auto">
                            <a href="#how-it-works" className="block w-full sm:w-auto text-center bg-[rgba(20,24,45,0.6)] hover:bg-[rgba(20,24,45,0.8)] border border-[rgba(124,92,255,0.15)] text-zinc-300 px-8 py-4 rounded-[14px] font-medium backdrop-blur transition-colors">
                                How It Works
                            </a>
                        </Magnetic>
                    </div>
                </div>
            </section>

            {/* 2. How It Works Section */}
            <section id="how-it-works" className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="section-title mb-4">How SecSky Protects Your Files</h2>
                        <p className="secondary-text max-w-2xl mx-auto">A seamless three-step process ensuring total data sovereignty.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="glass-card flex flex-col items-center text-center">
                            <div className="h-16 w-16 bg-[#0A0F1F] rounded-full flex items-center justify-center mb-6 border border-[#7C5CFF]/20 shadow-[0_0_15px_rgba(124,92,255,0.15)]">
                                <HardDrive className="text-[#8A63FF] w-8 h-8" strokeWidth={1.5} />
                            </div>
                            <h3 className="card-title mb-3">Step 1</h3>
                            <p className="secondary-text">Select and upload your file directly within your web browser.</p>
                        </div>

                        <div className="glass-card flex flex-col items-center text-center">
                            <div className="h-16 w-16 bg-[#0A0F1F] rounded-full flex items-center justify-center mb-6 border border-[#7C5CFF]/20 shadow-[0_0_15px_rgba(124,92,255,0.15)]">
                                <Lock className="text-[#8A63FF] w-8 h-8" strokeWidth={1.5} />
                            </div>
                            <h3 className="card-title mb-3">Step 2</h3>
                            <p className="secondary-text">Your browser instantly encrypts it locally with a unique AES-256 key before any upload begins.</p>
                        </div>

                        <div className="glass-card flex flex-col items-center text-center">
                            <div className="h-16 w-16 bg-[#0A0F1F] rounded-full flex items-center justify-center mb-6 border border-[#7C5CFF]/20 shadow-[0_0_15px_rgba(124,92,255,0.15)]">
                                <Shield className="text-[#8A63FF] w-8 h-8" strokeWidth={1.5} />
                            </div>
                            <h3 className="card-title mb-3">Step 3</h3>
                            <p className="secondary-text">Only encrypted data is stored. Decryption happens exclusively on your device upon download.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Zero-Knowledge Architecture */}
            <section className="py-32 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="section-title mb-8">True Zero-Knowledge Security</h2>
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
                        <div className="absolute inset-0 bg-[#7C5CFF]/5 blur-[100px] rounded-full"></div>
                        <div className="glass-card">
                            <div className="space-y-4 font-mono text-sm text-zinc-400">
                                <div className="flex justify-between items-center p-4 border border-[rgba(124,92,255,0.15)] rounded-xl bg-[#0A0F1F]">
                                    <span className="text-[#E6E9F2]">Client Browser</span>
                                    <span className="text-[#8A63FF]">AES-256-GCM Encrypt</span>
                                </div>
                                <div className="flex flex-col items-center text-zinc-600 my-2">
                                    <div className="h-6 w-px bg-zinc-700/50"></div>
                                    <ChevronDown className="w-5 h-5 text-[#8A63FF]/50" />
                                </div>
                                <div className="flex flex-col gap-3 p-5 border border-[rgba(124,92,255,0.15)] rounded-xl bg-[#0A0F1F]">
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
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">

                    {/* File Password */}
                    <div className="glass-card flex flex-col justify-center">
                        <div className="inline-block p-4 bg-[#0A0F1F] rounded-2xl border border-[rgba(124,92,255,0.15)] mb-8 self-start shadow-[0_0_15px_rgba(124,92,255,0.1)]">
                            <Key className="w-7 h-7 text-[#8A63FF]" />
                        </div>
                        <h2 className="section-title mb-6">Independent File-Level Locking</h2>
                        <p className="secondary-text leading-relaxed text-lg">
                            Add an additional password per file for maximum protection. File keys are double-wrapped, meaning an account login does not automatically unlock protected files.
                        </p>
                    </div>

                    {/* Why SecSky */}
                    <div className="glass-card flex flex-col justify-center">
                        <div className="inline-block p-4 bg-[#0A0F1F] rounded-2xl border border-[rgba(124,92,255,0.15)] mb-8 self-start shadow-[0_0_15px_rgba(124,92,255,0.1)]">
                            <Smartphone className="w-7 h-7 text-[#8A63FF]" />
                        </div>
                        <h2 className="section-title mb-6">Why SecSky</h2>
                        <ul className="space-y-5">
                            {[
                                "Zero-knowledge architecture",
                                "Client-side encryption",
                                "Multi-device access",
                                "Minimal, distraction-free UI",
                                "Built using modern cryptographic standards"
                            ].map((text, i) => (
                                <li key={i} className="flex items-center text-[#E6E9F2]">
                                    <div className="w-2 h-2 rounded-full bg-[#7C5CFF] mr-4 shadow-[0_0_8px_rgba(124,92,255,0.6)]"></div>
                                    <span className="text-lg font-medium tracking-wide">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </section>

            {/* 5. Security Specifications */}
            <section className="py-16 px-6 max-w-4xl mx-auto w-full">
                <button
                    onClick={() => setShowSpecs(!showSpecs)}
                    className="w-full text-left flex items-center justify-between glass-card hover:bg-[rgba(20,24,45,0.8)] cursor-pointer"
                >
                    <div className="flex items-center gap-4">
                        <Lock className="text-[#8A63FF] w-6 h-6" />
                        <h2 className="text-xl font-semibold text-[#E6E9F2]">Security Details</h2>
                    </div>
                    <ChevronDown className={`w-6 h-6 text-zinc-500 transition-transform duration-300 ${showSpecs ? 'rotate-180' : ''}`} />
                </button>

                {showSpecs && (
                    <div className="p-8 border-x border-b border-[rgba(124,92,255,0.15)] rounded-b-3xl bg-[rgba(10,15,31,0.6)] backdrop-blur-md mt-[-16px] pt-10 shadow-xl">
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
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="section-title mb-16 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        {faqs.map((faq, index) => (
                            <div key={index} className="glass-card p-0 overflow-hidden">
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full text-left p-6 flex justify-between items-center hover:bg-[rgba(20,24,45,0.8)] transition-colors cursor-pointer"
                                >
                                    <span className="font-medium text-lg text-[#E6E9F2]">{faq.q}</span>
                                    <ChevronDown className={`w-6 h-6 text-[#7C5CFF] transition-transform duration-300 ${expandedFaq === index ? 'rotate-180' : ''}`} />
                                </button>
                                {expandedFaq === index && (
                                    <div className="p-6 pt-0 secondary-text text-[1.05rem] leading-relaxed border-t border-[rgba(124,92,255,0.1)] mt-2">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 8. Final CTA */}
            <section className="py-40 px-6 text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#7C5CFF]/30 to-transparent"></div>
                <div className="max-w-3xl mx-auto relative z-10 flex flex-col items-center">
                    <h2 className="section-title mb-10 text-4xl md:text-5xl">Take Control of Your Data.</h2>
                    <Magnetic className="inline-block">
                        <Link to="/register" className="inline-block btn-primary px-10 py-5 text-lg">
                            Create Your Secure Vault
                        </Link>
                    </Magnetic>
                </div>
            </section>
        </div>
    );
}
