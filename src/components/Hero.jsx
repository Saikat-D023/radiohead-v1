import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ShapeCanvas from './ShapeCanvas';

export default function Hero() {
    const containerRef = useRef(null);
    const title1Ref = useRef(null);
    const title2Ref = useRef(null);
    const subtitleRef = useRef(null);

    useEffect(() => {
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
    }, []);

    return (
        <section id="hero" ref={containerRef} className="h-[100dvh] w-full flex flex-col justify-center items-center relative overflow-hidden">
            <ShapeCanvas />
            {/* Background Graphic or subtle glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] bg-[var(--color-plasma)] rounded-full blur-[120px] opacity-[0.15] mix-blend-screen pointer-events-none"></div>

            <div className="z-10 text-center px-4" style={{ perspective: '1000px' }}>
                <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter uppercase leading-[0.85] mb-6">
                    <div className="overflow-hidden pb-4">
                        <div ref={title1Ref} className="origin-bottom will-change-transform">EVERYTHING IN</div>
                    </div>
                    <div className="overflow-hidden pb-4 text-[var(--color-plasma)]">
                        <div ref={title2Ref} className="origin-bottom will-change-transform">ITS RIGHT PLACE</div>
                    </div>
                </h1>

                <div ref={subtitleRef} className="font-mono text-sm md:text-base uppercase max-w-2xl mx-auto flex flex-col gap-2 tracking-[0.2em] will-change-transform opacity-0">
                    <span>A definitive digital exploration</span>
                    {/* <span className="text-[var(--color-static)]">Sound. Vision. Paranoia.</span> */}
                    <span className="hover:text-[var(--color-static)] animate-pulse text-[var(--color-plasma)] transition-colors">[STATUS: OPTIMIZED]</span>
                </div>
            </div>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
                <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent"></div>
            </div>
        </section>
    );
}
