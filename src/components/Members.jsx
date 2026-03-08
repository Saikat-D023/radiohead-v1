import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const members = [
    { name: "Thom Yorke", role: "Vocals, Guitar, Keyboards, Programming", image: "/thom yorke.png" },
    { name: "Jonny Greenwood", role: "Lead Guitar, Keyboards, Ondes Martenot", image: "/Jonny Greenwood.png" },
    { name: "Colin Greenwood", role: "Bass Guitar, Synthesizers", image: "/Colin greenwooood.png" },
    { name: "Ed O'Brien", role: "Guitar, Effects, Backing Vocals", image: "/edo brien.png" },
    { name: "Philip Selway", role: "Drums, Percussion", image: "/selway.png" },
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
        <section ref={containerRef} id="members" className="h-screen w-full bg-[var(--color-void)] overflow-hidden border-t border-white/5 relative z-20 flex flex-col justify-center">

            <div className="absolute top-[8%] md:top-[12%] w-full flex justify-center z-0 pointer-events-none">
                <h2 className="text-[12vw] font-black uppercase text-transparent whitespace-nowrap leading-none tracking-tight" style={{ WebkitTextStroke: '2px var(--color-ghost)' }}>
                    THE FIVE INSTRUMENTS
                </h2>
            </div>

            <div ref={scrollRef} className="h-full w-[500vw] flex items-center relative z-10">
                {members.map((m, i) => (
                    <div key={i} className="member-card w-screen h-full flex items-center justify-center relative p-4 md:p-8">
                        <div className="w-full max-w-7xl xl:max-w-[85vw] border border-[var(--color-plasma)] bg-[var(--color-void)] p-8 md:p-16 flex flex-col justify-between" style={{ minHeight: '65vh' }}>
                            <div className="flex flex-col md:flex-row justify-between items-center w-full gap-8">
                                <div className="flex-1 text-left">
                                    <h3 className="text-6xl md:text-7xl lg:text-[7rem] font-bold uppercase tracking-tighter mb-4 text-white leading-[0.85] whitespace-pre-line drop-shadow-md">
                                        {m.name.replace(' ', '\n')}
                                    </h3>
                                    <p className="font-mono text-[10px] md:text-sm tracking-widest text-[#888888] uppercase mt-6">{m.role}</p>
                                </div>

                                <div className="w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 shrink-0">
                                    <img src={m.image} alt={m.name} className="w-full h-full object-cover shadow-2xl" />
                                </div>
                            </div>

                            <div className="mt-12 w-full h-16 md:h-24 flex items-end gap-[4px]">
                                {Array.from({ length: 42 }).map((_, j) => (
                                    <div key={j} className="flex-1 bg-[var(--color-plasma)]" style={{ height: `${20 + Math.random() * 80}%` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
