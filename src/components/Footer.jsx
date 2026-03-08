import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PowerOff } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
    const footerRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.fromTo('.shutdown-text',
                { opacity: 0, scale: 0.95, y: 50 },
                {
                    opacity: 1, scale: 1, y: 0, duration: 1.5, ease: 'power3.out',
                    scrollTrigger: {
                        trigger: footerRef.current,
                        start: 'top 80%',
                    }
                }
            );
        }, footerRef);
        return () => ctx.revert();
    }, []);

    return (
        <footer ref={footerRef} className="h-screen w-full bg-[#030303] flex flex-col items-center justify-center relative overflow-hidden z-40">
            <div className="absolute inset-0 bg-[var(--color-plasma)] opacity-0 hover:opacity-[0.03] transition-opacity duration-1000 pointer-events-none"></div>

            <div className="shutdown-text text-center flex flex-col items-center z-10">
                <PowerOff className="w-16 h-16 md:w-24 md:h-24 text-[var(--color-plasma)] mb-12 animate-pulse cursor-pointer hover:scale-110 hover:drop-shadow-[0_0_20px_var(--color-plasma)] transition-all duration-300"
                    onClick={() => window.location.href = "/"} />
                <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-none text-white/90">System</h2>
                <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-[var(--color-plasma)] leading-none text-shadow-sm shadow-black">Shutdown</h2>
                <p className="mt-16 font-mono text-xs md:text-sm tracking-widest opacity-40 uppercase">End of Transmission // Radiohead Archive</p>
            </div>
        </footer>
    );
}
