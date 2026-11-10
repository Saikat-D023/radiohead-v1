import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const members = [
    { name: "Thom Yorke", role: "Vocals, Guitar, Keyboards, Programming", image: "/thom yorke.png" },
    { name: "Jonny Greenwood", role: "Lead Guitar, Keyboards, Ondes Martenot", image: "/Jonny Greenwood.png" },
    { name: "Colin Greenwood", role: "Bass Guitar, Synthesizers", image: "/Colin greenwooood.png" },
    { name: "Ed O'Brien", role: "Guitar, Effects, Backing Vocals", image: "/edo brien.png" },
    { name: "Philip Selway", role: "Drums, Percussion", image: "/selway.png" },
];

export default function Members() {
    const containerRef = useRef(null);

    useGSAP(() => {
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
        <section id="members" ref={containerRef} className="h-screen w-full relative overflow-hidden bg-cover bg-center z-20" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1531685250784-7569952593d2?q=80&w=1920&auto=format&fit=crop")' }}>
            <div className="absolute inset-0 bg-black/70 pointer-events-none"></div>

            <div className="absolute top-8 left-12 z-10 museum-placard max-w-sm">
                <h2 className="title-serif text-2xl tracking-widest uppercase">The Portrait Gallery</h2>
                <p className="font-sans text-sm italic mt-2">Core Members & Contributors</p>
            </div>

            <div className="h-full w-full flex items-center justify-center relative z-10 pt-20 px-8">
                <div className="flex flex-wrap justify-center gap-10 max-w-6xl">
                    {members.map((m, i) => (
                        <div key={i} className="flex flex-col items-center group">
                            <div className="museum-frame transition-transform duration-500 group-hover:scale-105">
                                <div className="w-32 h-32 md:w-48 md:h-48 overflow-hidden">
                                    <img src={m.image} alt={m.name} className="w-full h-full object-cover filter grayscale sepia-[.3] transition-all duration-700 group-hover:grayscale-0 group-hover:sepia-0" />
                                </div>
                            </div>
                            <div className="mt-6 text-center bg-[#f8f5eb] border border-[#d4af37] px-4 py-2 shadow-lg max-w-[200px]">
                                <h3 className="font-bold text-sm uppercase tracking-tighter title-serif text-[#1a1a1a]">
                                    {m.name}
                                </h3>
                                <p className="font-sans text-[9px] tracking-widest text-[#4a4a4a] uppercase mt-1">{m.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
