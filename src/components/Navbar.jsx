import React, { useEffect, useState, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import gsap from 'gsap';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const linksRef = useRef([]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isOpen) {
            gsap.to(menuRef.current, {
                y: 0,
                duration: 0.5,
                ease: "power4.out"
            });
            gsap.fromTo(linksRef.current,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, delay: 0.2, ease: "power3.out" }
            );
        } else {
            gsap.to(menuRef.current, {
                y: "-100%",
                duration: 0.5,
                ease: "power4.in"
            });
        }
    }, [isOpen]);

    const navLinks = [
        { name: 'Start', href: '#hero' },
        { name: 'Albums', href: '#albums' },
        { name: 'Members', href: '#members' },
        { name: 'Philosophy', href: '#philosophy' },
    ];

    return (
        <>
            <nav className={`fixed top-0 w-full z-[60] transition-all duration-500 ease-out ${(scrolled && !isOpen) ? 'bg-[var(--color-void)]/80 backdrop-blur-md py-4 border-b border-white/5' : 'bg-transparent py-6'}`}>
                <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
                    <div className="font-mono text-sm tracking-widest flex items-center gap-4 relative z-[60]">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-plasma)] animate-pulse hidden md:block"></span>
                        <div className="flex flex-col">
                            <span className="font-bold">RADIOHEAD</span>
                            <span className="text-[10px] text-white/50">ARCHIVE_v1.0</span>
                        </div>
                    </div>

                    <div className="hidden md:flex gap-8 font-mono text-xs tracking-widest uppercase relative z-[60]">
                        {navLinks.map((link) => (
                            <a key={link.name} href={link.href} className="hover:text-[var(--color-plasma)] transition-colors">{link.name}</a>
                        ))}
                    </div>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-white/80 hover:text-white transition-colors relative z-[60]"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                ref={menuRef}
                className="fixed inset-0 bg-[#0a0a0a] z-[55] flex flex-col justify-center items-center"
                style={{ transform: 'translateY(-100%)' }}
            >
                <div className="flex flex-col gap-8 font-mono text-2xl tracking-widest uppercase text-center">
                    {navLinks.map((link, index) => (
                        <a
                            key={link.name}
                            href={link.href}
                            ref={el => linksRef.current[index] = el}
                            onClick={() => setIsOpen(false)}
                            className="hover:text-[var(--color-plasma)] transition-colors opacity-0"
                        >
                            {link.name}
                        </a>
                    ))}
                </div>
            </div>
        </>
    );
}
