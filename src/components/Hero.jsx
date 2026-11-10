import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);
import ShapeCanvas from './ShapeCanvas';

export default function Hero() {
    const containerRef = useRef(null);
    const title1Ref = useRef(null);
    const title2Ref = useRef(null);
    const subtitleRef = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline({ delay: 0.5 });

        tl.fromTo(title1Ref.current,
            { y: 120, opacity: 0, rotationX: 60 },
            { y: 0, opacity: 1, rotationX: 0, duration: 1.8, ease: 'power4.out' }
        )
            .fromTo(title2Ref.current,
                { y: 120, opacity: 0, rotationX: 60 },
                { y: 0, opacity: 1, rotationX: 0, duration: 1.8, ease: 'power4.out' },
                "-=1.4"
            )
            .fromTo(subtitleRef.current,
                { opacity: 0, y: 20 },
                { opacity: 0.6, y: 0, duration: 1.5, ease: 'power2.out' },
                "-=1"
            );
            
        // Parallax effect for transition to next section
        gsap.to(containerRef.current, {
            yPercent: 30,
            ease: "none",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });
    }, { scope: containerRef });

    return (
        <section id="hero" ref={containerRef} className="h-screen w-screen flex flex-col justify-center items-center relative overflow-hidden bg-cover bg-center z-0" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1920&auto=format&fit=crop")' }}>
            <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>

            <div className="z-10 text-center px-4 museum-placard" style={{ perspective: '1000px' }}>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight uppercase leading-tight mb-4 title-serif text-[#1a1a1a]">
                    <div className="overflow-hidden pb-2">
                        <div ref={title1Ref} className="origin-bottom will-change-transform">RADIOHEAD</div>
                    </div>
                    <div className="overflow-hidden pb-2 text-[var(--color-oxblood)]">
                        <div ref={title2Ref} className="origin-bottom will-change-transform text-2xl md:text-3xl mt-2 tracking-widest">DIGITAL ARCHIVE</div>
                    </div>
                </h1>

                <div ref={subtitleRef} className="font-sans text-sm md:text-base max-w-2xl mx-auto flex flex-col gap-2 tracking-wide will-change-transform opacity-0 text-[#2a2a2a] italic">
                    <span>A definitive digital exploration</span>
                    <span>Curated Exhibition</span>
                </div>
            </div>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-70 flex flex-col items-center gap-2 text-white">
                <span className="font-serif italic text-sm">Scroll Down</span>
                <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent"></div>
            </div>
        </section>
    );
}
