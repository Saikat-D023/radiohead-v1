import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const members = [
    { name: "Thom Yorke", role: "Vocals, Guitar, Keyboards, Programming" },
    { name: "Jonny Greenwood", role: "Lead Guitar, Keyboards, Ondes Martenot" },
    { name: "Colin Greenwood", role: "Bass Guitar, Synthesizers" },
    { name: "Ed O'Brien", role: "Guitar, Effects, Backing Vocals" },
    { name: "Philip Selway", role: "Drums, Percussion" },
];

export default function Members() {
    const containerRef = useRef(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            const panels = gsap.utils.toArray('.member-card');
            gsap.to(panels, {
                xPercent: -100 * (panels.length - 1),
                ease: 'none',
                scrollTrigger: {
                    trigger: containerRef.current,
                    pin: true,
                    scrub: 1,
                    end: () => "+=" + containerRef.current.offsetWidth
                }
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} id="members" className="h-screen w-full bg-[var(--color-void)] overflow-hidden border-t border-white/5 relative z-20">
            <div className="absolute top-12 left-6 md:left-12 z-10 mix-blend-difference pointer-events-none">
                <h2 className="text-3xl md:text-8xl font-black uppercase text-transparent" style={{ WebkitTextStroke: '1px var(--color-ghost)' }}>
                    The Five Instruments
                </h2>
            </div>
            <div ref={scrollRef} className="h-full w-[500vw] flex items-center">
                {members.map((m, i) => (
                    <div key={i} className="member-card w-screen h-full flex items-center justify-center relative group p-6 md:p-12">
                        <div className="absolute inset-x-0 h-full w-full opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-700 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSIjRkZGIi8+Cjwvc3ZnPg==')]" />
                        <div className="w-full max-w-4xl border border-white/10 bg-black/60 backdrop-blur-md p-8 md:p-16 relative overflow-hidden group-hover:border-[var(--color-plasma)] transition-colors duration-500">
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-plasma)] opacity-0 group-hover:animate-scan shadow-[0_0_15px_var(--color-plasma)]" />
                            <h3 className="text-4xl md:text-6xl lg:text-8xl font-black uppercase tracking-tighter mb-4 text-white">{m.name}</h3>
                            <p className="font-mono text-sm md:text-base tracking-widest text-white/50 uppercase">{m.role}</p>

                            <div className="mt-12 md:mt-20 w-full h-16 md:h-24 flex items-end gap-[2px] opacity-20 group-hover:opacity-100 transition-opacity duration-1000">
                                {Array.from({ length: 40 }).map((_, j) => (
                                    <div key={j} className="flex-1 bg-[var(--color-plasma)]" style={{ height: `${20 + Math.random() * 80}%`, transition: 'height 0.1s', transitionDelay: `${j * 0.01}s` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
