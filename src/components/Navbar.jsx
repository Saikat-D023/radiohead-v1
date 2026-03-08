import React, { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ease-out ${scrolled ? 'bg-[var(--color-void)]/80 backdrop-blur-md py-4 border-b border-white/5' : 'bg-transparent py-6'}`}>
            <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
                <div className="font-mono text-sm tracking-widest flex items-center gap-4">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-plasma)] animate-pulse hidden md:block"></span>
                    <div className="flex flex-col">
                        <span className="font-bold">RADIOHEAD</span>
                        <span className="text-[10px] text-white/50">ARCHIVE_v1.0</span>
                    </div>
                </div>

                <div className="hidden md:flex gap-8 font-mono text-xs tracking-widest uppercase">
                    <a href="#hero" className="hover:text-[var(--color-plasma)] transition-colors">Start</a>
                    <a href="#albums" className="hover:text-[var(--color-plasma)] transition-colors">Albums</a>
                    <a href="#members" className="hover:text-[var(--color-plasma)] transition-colors">Members</a>
                    <a href="#philosophy" className="hover:text-[var(--color-plasma)] transition-colors">Philosophy</a>
                </div>

                <button className="md:hidden text-white/80 hover:text-white transition-colors">
                    <Menu className="w-6 h-6" />
                </button>
            </div>
        </nav>
    );
}
