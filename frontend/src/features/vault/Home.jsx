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
            <div className="grid-overlay"></div>

            {/* HERO SECTION */}
            <section className="pt-[140px] pb-[120px] px-[60px] max-w-[1200px] mx-auto w-full relative z-10">
                <div className="flex flex-col items-start text-left">
                    <h1 className="text-[72px] font-semibold tracking-[-0.04em] leading-[1.05] text-[#E6E9F2] max-w-[900px] mb-6">
                        <span className="gradient-text">Zero-knowledge</span> cloud storage <br className="hidden md:block" />
                        built for serious privacy.
                    </h1>

                    <p className="text-[20px] text-[#A0A6C3] max-w-[600px] mb-10 font-normal">
                        Files are encrypted on your device before upload. <br className="hidden sm:block" />
                        Only you hold the keys.
                    </p>

                    <div className="flex items-center gap-4">
                        <Link to={user ? "/files" : "/register"} className="block btn-primary">
                            {user ? "Go to Files" : "Start Free"}
                        </Link>
                        <a href="#how-it-works" className="block btn-secondary">
                            How it Works
                        </a>
                    </div>
                </div>
            </section>

            {/* FEATURE GRID */}
            <section className="border-t border-[rgba(255,255,255,0.06)] border-b pb-[120px] relative z-10 section-blue">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[80px] pt-[120px] px-[60px] max-w-[1200px] mx-auto w-full">
                    <div>
                        <h2 className="text-[40px] font-semibold tracking-[-0.02em] text-[#E6E9F2] mb-4">Client-side encryption</h2>
                        <p className="text-[16px] text-[#A0A6C3] font-normal leading-relaxed">
                            Every file is encrypted with <span className="accent-blue">AES-256-GCM</span> before it leaves your device. We never receive your plaintext data.
                        </p>
                    </div>
                    <div>
                        <h2 className="text-[40px] font-semibold tracking-[-0.02em] text-[#E6E9F2] mb-4">Isolated password layers</h2>
                        <p className="text-[16px] text-[#A0A6C3] font-normal leading-relaxed">
                            Add secondary encryption to <span className="accent-green">individual files</span> or <span className="accent-purple">folders</span>. Master authentication does not automatically unpack your most sensitive files.
                        </p>
                    </div>
                </div>
            </section>

            {/* SECURITY ARCHITECTURE */}
            <section className="py-[120px] px-[60px] max-w-[1200px] mx-auto w-full section-divider relative z-10 section-purple">
                <div className="grid lg:grid-cols-2 gap-[80px] items-center">
                    <div>
                        <h2 className="text-[40px] font-semibold tracking-[-0.02em] text-[#E6E9F2] mb-6">Designed for total sovereignty.</h2>
                        <p className="text-[16px] text-[#A0A6C3] font-normal leading-relaxed mb-6">
                            SecSky relies entirely on standardized <span className="accent-purple">Web Crypto APIs</span> directly inside your local environment constraint.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "No plaintext file storage.",
                                "We cannot decrypt your files.",
                                "If you forget your password, data is destroyed."
                            ].map((text, i) => (
                                <li key={i} className="flex items-center text-[#E6E9F2] font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] mr-4"></div>
                                    <span>{text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-[rgba(20,24,45,0.6)] border border-[rgba(255,255,255,0.08)] p-[40px] rounded-[16px]">
                        <div className="space-y-4 font-mono text-sm text-[#A0A6C3]">
                            <div className="flex justify-between items-center pb-3 border-b border-[rgba(255,255,255,0.05)]">
                                <span>Key Derivation</span>
                                <span className="text-[#8A63FF]">PBKDF2 (600k ops)</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-[rgba(255,255,255,0.05)]">
                                <span>Block Cipher</span>
                                <span className="text-[#8A63FF]">AES-256-GCM</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-[rgba(255,255,255,0.05)]">
                                <span>Storage Layer</span>
                                <span className="text-[#8A63FF]">Encrypted BSON Blobs</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Access Security</span>
                                <span className="text-[#8A63FF]">HttpOnly JWT</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how-it-works" className="py-[120px] px-[60px] max-w-[1200px] mx-auto w-full section-divider relative z-10 section-green">
                <div className="mb-16">
                    <h2 className="text-[40px] font-semibold tracking-[-0.02em] text-[#E6E9F2] mb-4">How it works</h2>
                    <p className="text-[16px] text-[#A0A6C3] font-normal">A mathematically protected pipeline.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-[80px]">
                    <div className="glass-card">
                        <h3 className="text-[22px] font-medium text-[#E6E9F2] mb-3">1. Derive</h3>
                        <p className="text-[16px] text-[#A0A6C3] leading-relaxed">Your browser derives a crypto-master key from your secure text password locally using highly salted PBKDF2 iterations.</p>
                    </div>
                    <div className="glass-card">
                        <h3 className="text-[22px] font-medium text-[#E6E9F2] mb-3">2. Encrypt</h3>
                        <p className="text-[16px] text-[#A0A6C3] leading-relaxed">Files are authenticated and encrypted seamlessly in-memory inside the browser using AES-256-GCM before connecting to <span className="gradient-text">our APIs</span>.</p>
                    </div>
                    <div className="glass-card">
                        <h3 className="text-[22px] font-medium text-[#E6E9F2] mb-3">3. Upload</h3>
                        <p className="text-[16px] text-[#A0A6C3] leading-relaxed">Only the completely unreadable encrypted binary blobs leave your system. Decryption requires the same local browser environment and key.</p>
                    </div>
                </div>
            </section>

            {/* PRODUCT PREVIEW */}
            <section className="py-[120px] px-[60px] max-w-[1200px] mx-auto w-full section-divider relative z-10 section-blue">
                <div className="grid lg:grid-cols-2 gap-[80px] items-center">
                    <div>
                        <h2 className="text-[40px] font-semibold tracking-[-0.02em] text-[#E6E9F2] mb-6">Built-in file manager with folder isolation</h2>
                        <p className="text-[16px] text-[#A0A6C3] font-normal leading-relaxed">
                            SecSky provides an interactive, full-stack vault interface that reconstructs nested file directories, uploads, deletes, and movements natively all while remaining opaque to the server.
                        </p>
                    </div>
                    <div className="border border-[rgba(255,255,255,0.08)] rounded-[18px] overflow-hidden bg-[rgba(20,24,45,0.4)] aspect-video flex flex-col items-center justify-center p-8 backdrop-blur(12px)">
                        {/* Abstracted structural representation of Files UI without importing heavy image assets strictly for investor wireframing */}
                        <div className="w-full h-full border border-[rgba(124,92,255,0.15)] rounded-xl p-4 flex flex-col gap-4 relative">
                            <div className="w-1/3 h-6 bg-[rgba(255,255,255,0.05)] rounded"></div>
                            <div className="flex gap-4 w-full h-full pt-4">
                                <div className="w-1/4 h-full border-r border-[rgba(255,255,255,0.05)] flex flex-col gap-3 pr-4">
                                    <div className="h-4 w-full bg-[rgba(124,92,255,0.15)] rounded"></div>
                                    <div className="h-4 w-3/4 bg-[rgba(255,255,255,0.03)] rounded"></div>
                                    <div className="h-4 w-5/6 bg-[rgba(255,255,255,0.03)] rounded"></div>
                                </div>
                                <div className="flex-1 h-full grid grid-cols-3 gap-3">
                                    <div className="bg-[rgba(255,255,255,0.02)] rounded-lg"></div>
                                    <div className="bg-[rgba(255,255,255,0.02)] rounded-lg"></div>
                                    <div className="bg-[rgba(255,255,255,0.02)] rounded-lg"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-[140px] px-[60px] text-center max-w-[1200px] mx-auto w-full relative z-10 section-divider">
                <h2 className="text-[40px] md:text-[64px] font-semibold tracking-[-0.04em] leading-[1.05] text-[#E6E9F2] mb-10">Own your encryption.</h2>
                <Link to="/register" className="inline-block btn-primary">
                    Create Secure Vault
                </Link>
            </section>

        </div>
    );
}
