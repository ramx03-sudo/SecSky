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
            <section className="pt-[140px] pb-[100px] px-[60px] max-w-[1200px] mx-auto w-full relative z-10">
                <div className="flex flex-col items-start text-left">
                    <h1 className="text-[72px] font-semibold tracking-[-0.04em] leading-[1.05] text-[#E6E9F2] max-w-[900px] mb-6">
                        <span className="gradient-text">Zero-knowledge</span> cloud storage <br className="hidden md:block" />
                        built for serious privacy.
                    </h1>

                    <p className="text-[20px] text-[#A0A6C3] max-w-[600px] mb-8 font-normal">
                        Files are encrypted inside your browser before upload. <br className="hidden sm:block" />
                        Only you hold the keys. Not us. Not the server.
                    </p>

                    <p className="text-[14px] text-[#A0A6C3] font-mono mb-10 opacity-80">
                        Designed & Engineered by <span className="text-[#E6E9F2]">Ram Mamillapalli</span>
                    </p>

                    <div className="flex items-center gap-4">
                        <Link to={user ? "/files" : "/register"} className="block btn-primary text-[15px]">
                            {user ? "Go to Files" : "Create Secure Vault"}
                        </Link>
                        <a href="#how-it-works" className="block btn-secondary text-[15px]">
                            How It Works
                        </a>
                    </div>
                </div>
            </section>

            {/* WHAT IS SECSKY / WHY THIS MATTERS */}
            <section className="border-t border-[rgba(255,255,255,0.06)] border-b pb-[120px] relative z-10 section-blue">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[80px] pt-[120px] px-[60px] max-w-[1200px] mx-auto w-full">
                    <div>
                        <div className="text-[12px] font-mono tracking-wider text-[#8A63FF] uppercase mb-4">What Is SecSky?</div>
                        <h2 className="text-[40px] font-semibold tracking-[-0.02em] text-[#E6E9F2] mb-6">Privacy infrastructure, not just storage.</h2>
                        <p className="text-[16px] text-[#A0A6C3] font-normal leading-relaxed mb-6">
                            SecSky is a client-side cryptographic vault platform built by Ram Mamillapalli to eliminate plaintext exposure in cloud storage systems.
                        </p>
                        <p className="text-[16px] text-[#A0A6C3] font-normal leading-relaxed mb-4">
                            Unlike traditional storage providers, SecSky never receives:
                        </p>
                        <ul className="space-y-3 mb-6">
                            {["Your encryption keys", "Your master password", "Your decrypted files", "Your raw metadata"].map((item, i) => (
                                <li key={i} className="flex items-center text-[#E6E9F2] font-medium text-[15px]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#8A63FF] mr-4 shadow-[0_0_8px_rgba(138,99,255,0.6)]"></div>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="text-[16px] text-[#A0A6C3] font-normal leading-relaxed">
                            Everything is encrypted locally before any network transmission. <br className="hidden sm:block" />
                            <span className="accent-blue font-medium mt-2 inline-block">You are the cryptographic authority.</span>
                        </p>
                    </div>
                    <div>
                        <div className="text-[12px] font-mono tracking-wider text-[#8A63FF] uppercase mb-4">Why This Matters</div>
                        <h2 className="text-[40px] font-semibold tracking-[-0.02em] text-[#E6E9F2] mb-6">Trust math, not servers.</h2>
                        <p className="text-[16px] text-[#A0A6C3] font-normal leading-relaxed mb-6">
                            Most cloud providers operate on a "trust us" model. SecSky eliminates trust dependency.
                        </p>
                        <p className="text-[16px] text-[#E6E9F2] font-medium leading-relaxed mb-4">
                            You trust math.
                        </p>
                        <ul className="space-y-3 mb-6 block border-l border-[rgba(255,255,255,0.1)] pl-4">
                            <li className="text-[16px] text-[#A0A6C3]">Not the company.</li>
                            <li className="text-[16px] text-[#A0A6C3]">Not the backend.</li>
                            <li className="text-[16px] text-[#A0A6C3]">Not the database.</li>
                        </ul>
                        <p className="text-[16px] text-[#E6E9F2] font-medium leading-relaxed">
                            This is cryptographic sovereignty.
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
                <div className="mb-16 max-w-[800px]">
                    <div className="text-[12px] font-mono tracking-wider text-[#4FD1C5] uppercase mb-4">How It Works (User Flow)</div>
                    <h2 className="text-[40px] font-semibold tracking-[-0.02em] text-[#E6E9F2] mb-4">A mathematically protected pipeline.</h2>
                    <p className="text-[16px] text-[#A0A6C3] font-normal">SecSky operates through a deterministic browser-based security model engineered by Ram Mamillapalli.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-[40px]">
                    {/* 1 */}
                    <div className="glass-card flex flex-col">
                        <div className="text-[14px] text-[#4FD1C5] font-mono mb-2">01</div>
                        <h3 className="text-[20px] font-medium text-[#E6E9F2] mb-3">Account Authentication</h3>
                        <p className="text-[15px] text-[#A0A6C3] leading-relaxed mb-4">When you register, you create a login password. A cryptographically secure random salt is generated. Your master password never leaves your device.</p>
                        <p className="text-[13px] text-[#A0A6C3] font-mono opacity-80 border-t border-[rgba(255,255,255,0.06)] pt-4 mt-auto">Login auth is handled securely via HttpOnly JWT cookies. The session establishes identity — not encryption authority.</p>
                    </div>
                    {/* 2 */}
                    <div className="glass-card flex flex-col">
                        <div className="text-[14px] text-[#4FD1C5] font-mono mb-2">02</div>
                        <h3 className="text-[20px] font-medium text-[#E6E9F2] mb-3">Vault Unlock</h3>
                        <p className="text-[15px] text-[#A0A6C3] leading-relaxed mb-4">After login, you are prompted for your Master Password. This is where encryption authority begins.</p>
                        <p className="text-[13px] text-[#A0A6C3] font-mono opacity-80 border-t border-[rgba(255,255,255,0.06)] pt-4 mt-auto">Inside your browser: PBKDF2 (600k ops) + SHA-256 + CSPRNG salt. Key is destroyed on refresh.</p>
                    </div>
                    {/* 3 */}
                    <div className="glass-card flex flex-col">
                        <div className="text-[14px] text-[#4FD1C5] font-mono mb-2">03</div>
                        <h3 className="text-[20px] font-medium text-[#E6E9F2] mb-3">Client-Side Encryption</h3>
                        <p className="text-[15px] text-[#A0A6C3] leading-relaxed mb-4">When uploading, a random file key is generated. The file is encrypted in-memory using AES-256-GCM, then the file key is wrapped with your master key.</p>
                        <p className="text-[13px] text-[#A0A6C3] font-mono opacity-80 border-t border-[rgba(255,255,255,0.06)] pt-4 mt-auto">The server only receives encrypted blobs and wrapped keys. We cannot decrypt it.</p>
                    </div>
                    {/* 4 */}
                    <div className="glass-card flex flex-col">
                        <div className="text-[14px] text-[#4FD1C5] font-mono mb-2">04</div>
                        <h3 className="text-[20px] font-medium text-[#E6E9F2] mb-3">Isolated Password Layers</h3>
                        <p className="text-[15px] text-[#A0A6C3] leading-relaxed mb-4">Add secondary encryption layers per file/folder. Creates additional key derivation and separate salt isolation.</p>
                        <p className="text-[13px] text-[#A0A6C3] font-mono opacity-80 border-t border-[rgba(255,255,255,0.06)] pt-4 mt-auto">Engineered by Ram Mamillapalli to prevent lateral exposure. Login auth does not unlock isolated files.</p>
                    </div>
                    {/* 5 */}
                    <div className="glass-card flex flex-col">
                        <div className="text-[14px] text-[#4FD1C5] font-mono mb-2">05</div>
                        <h3 className="text-[20px] font-medium text-[#E6E9F2] mb-3">Storage Architecture</h3>
                        <p className="text-[15px] text-[#A0A6C3] leading-relaxed mb-4">MongoDB (Encrypted BSON blobs only). No plaintext files, metadata, or recoverable keys.</p>
                        <p className="text-[13px] text-[#A0A6C3] font-mono opacity-80 border-t border-[rgba(255,255,255,0.06)] pt-4 mt-auto">Server-side components never have cryptographic authority. True zero-knowledge design.</p>
                    </div>
                    {/* 6 */}
                    <div className="glass-card flex flex-col">
                        <div className="text-[14px] text-[#4FD1C5] font-mono mb-2">06</div>
                        <h3 className="text-[20px] font-medium text-[#E6E9F2] mb-3">Decryption</h3>
                        <p className="text-[15px] text-[#A0A6C3] leading-relaxed mb-4">Encrypted blob is fetched. Wrapped key is unwrapped using your master key. AES-256-GCM decrypts in memory.</p>
                        <p className="text-[13px] text-[#A0A6C3] font-mono opacity-80 border-t border-[rgba(255,255,255,0.06)] pt-4 mt-auto">Lose the password → data destroyed permanently. No backdoors.</p>
                    </div>
                </div>
            </section>

            {/* SYSTEM ARCHITECTURE & PRODUCT EXPERIENCE */}
            <section className="py-[120px] px-[60px] max-w-[1200px] mx-auto w-full section-divider relative z-10 section-purple">
                <div className="grid lg:grid-cols-2 gap-[80px] items-start">
                    <div>
                        <div className="text-[12px] font-mono tracking-wider text-[#8A63FF] uppercase mb-4">Product Experience</div>
                        <h2 className="text-[40px] font-semibold tracking-[-0.02em] text-[#E6E9F2] mb-6">Built-in file manager with folder isolation.</h2>
                        <p className="text-[16px] text-[#A0A6C3] font-normal leading-relaxed mb-6">
                            SecSky reconstructs nested directories entirely from <span className="accent-purple">encrypted metadata</span>.
                        </p>
                        <ul className="space-y-4 mb-6">
                            {[
                                "Create folders",
                                "Move files",
                                "Add isolated passwords",
                                "Download securely",
                                "Permanently destroy data"
                            ].map((text, i) => (
                                <li key={i} className="flex items-center text-[#E6E9F2] font-medium text-[15px]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#8A63FF] mr-4 shadow-[0_0_8px_rgba(138,99,255,0.6)]"></div>
                                    <span>{text}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="text-[16px] text-[#A0A6C3] font-normal leading-relaxed">
                            All without the server understanding file contents.
                        </p>
                    </div>

                    <div>
                        <div className="text-[12px] font-mono tracking-wider text-[#8A63FF] uppercase mb-4">System Architecture</div>
                        <h2 className="text-[40px] font-semibold tracking-[-0.02em] text-[#E6E9F2] mb-6">Built on hardened standards.</h2>
                        <div className="glass-card p-[40px]">
                            <div className="space-y-4 font-mono text-sm text-[#A0A6C3]">
                                <div className="flex justify-between items-center pb-3 border-b border-[rgba(255,255,255,0.05)]">
                                    <span>Key Derivation</span>
                                    <span className="text-[#8A63FF]">PBKDF2 (600,000 ops)</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-[rgba(255,255,255,0.05)]">
                                    <span>Block Cipher</span>
                                    <span className="text-[#8A63FF]">AES-256-GCM</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-[rgba(255,255,255,0.05)]">
                                    <span>Entropy Source</span>
                                    <span className="text-[#8A63FF]">Web Crypto API</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-[rgba(255,255,255,0.05)]">
                                    <span>Transport</span>
                                    <span className="text-[#8A63FF]">HTTPS + Secure HttpOnly JWT</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-[rgba(255,255,255,0.05)]">
                                    <span>Storage</span>
                                    <span className="text-[#8A63FF]">Encrypted BSON Blobs</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Isolation Model</span>
                                    <span className="text-[#8A63FF]">Master + Secondary Keys</span>
                                </div>
                            </div>
                            <div className="mt-8 text-[12px] font-mono text-[#A0A6C3] opacity-60">
                                Built & architected by Ram Mamillapalli
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECURITY GUARANTEES & BRANDING SECTION */}
            <section className="py-[120px] px-[60px] max-w-[1200px] mx-auto w-full section-divider relative z-10 section-blue">
                <div className="grid lg:grid-cols-2 gap-[80px] items-center">
                    <div>
                        <div className="text-[12px] font-mono tracking-wider text-[#63B3ED] uppercase mb-4">Authority Security</div>
                        <h2 className="text-[40px] font-semibold tracking-[-0.02em] text-[#E6E9F2] mb-6">Security Guarantees</h2>
                        <ul className="space-y-4 mb-8">
                            {[
                                "Zero plaintext file storage",
                                "No master password storage",
                                "No server-side key retention",
                                "Browser-only encryption",
                                "High iteration key derivation",
                                "Cryptographic isolation"
                            ].map((text, i) => (
                                <li key={i} className="flex items-center text-[#E6E9F2] font-medium text-[16px]">
                                    <CheckCircle2 className="w-5 h-5 text-[#63B3ED] mr-4" />
                                    <span>{text}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="text-[14px] text-[#A0A6C3] font-mono opacity-80">Engineered for uncompromising privacy by Ram Mamillapalli</p>
                    </div>

                    <div className="glass-card p-[40px]">
                        <div className="text-[12px] font-mono tracking-wider text-[#4FD1C5] uppercase mb-4">Platform Origin</div>
                        <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-[#E6E9F2] mb-4">Designed & Engineered by <br className="hidden sm:block" /><span className="gradient-text">Ram Mamillapalli</span></h2>
                        <p className="text-[15px] text-[#A0A6C3] font-normal leading-relaxed mb-6">
                            SecSky is independently designed and developed by Ram Mamillapalli, focusing on:
                        </p>
                        <ul className="space-y-3 mb-8 block border-l border-[rgba(255,255,255,0.1)] pl-4">
                            <li className="text-[15px] font-medium text-[#A0A6C3]">Applied cryptography</li>
                            <li className="text-[15px] font-medium text-[#A0A6C3]">Browser-native security architecture</li>
                            <li className="text-[15px] font-medium text-[#A0A6C3]">Secure cloud abstraction</li>
                            <li className="text-[15px] font-medium text-[#A0A6C3]">Zero-knowledge storage design</li>
                        </ul>
                        <p className="text-[15px] text-[#E6E9F2] font-medium leading-relaxed">
                            This is not a wrapper over third-party encryption. It is a purpose-built security system.
                        </p>
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-[140px] px-[60px] text-center max-w-[1200px] mx-auto w-full relative z-10 section-divider">
                <h2 className="text-[40px] md:text-[64px] font-semibold tracking-[-0.04em] leading-[1.05] text-[#E6E9F2] mb-10">Own your encryption.</h2>
                <Link to="/register" className="inline-block btn-primary mb-8 text-[18px] px-10 py-5">
                    Create Secure Vault
                </Link>
                <p className="text-[14px] text-[#A0A6C3] font-mono opacity-80 mt-4">Built with cryptographic integrity by Ram Mamillapalli.</p>
            </section>

        </div>
    );
}
