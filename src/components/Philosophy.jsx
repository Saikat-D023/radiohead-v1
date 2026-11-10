import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Philosophy() {
    const [text, setText] = useState('');
    const fullText = "THIS IS THE RADIOHEAD PUBLIC BROADCAST SYSTEM. WE ARE NOT SCAREMONGERING. THIS IS REALLY HAPPENING. EVERYONE IS BROKEN. EVERYTHING IS BROKEN.";
    const containerRef = useRef(null);

    useGSAP(() => {
        ScrollTrigger.create({
            trigger: containerRef.current,
            start: 'top 70%',
            onEnter: () => {
                let i = 0;
                const interval = setInterval(() => {
                    setText(fullText.substring(0, i));
                    i++;
                    if (i > fullText.length) clearInterval(interval);
                }, 30);
            }
        });

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
    }, { scope: containerRef, dependencies: [fullText] });

    return (
        <section id="philosophy" ref={containerRef} className="h-screen w-full relative overflow-hidden bg-cover bg-center flex items-center justify-center z-20" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=1920&auto=format&fit=crop")' }}>
            <div className="absolute inset-0 bg-black/80 pointer-events-none"></div>

            <div className="absolute top-12 right-12 z-20 museum-placard max-w-sm">
                <h2 className="title-serif text-2xl tracking-widest uppercase">The Propaganda Room</h2>
                <p className="font-sans text-sm italic mt-2">Manifestos & Ideals</p>
            </div>

            <div className="max-w-4xl mx-auto w-full relative z-10 px-8">
                <div className="museum-frame p-8 md:p-16">
                    <h2 className="text-sm md:text-base text-[var(--color-plasma)] font-serif italic mb-8 flex items-center gap-4">
                        <span className="w-2 h-2 bg-[var(--color-plasma)] inline-block"></span>
                        Excerpt from the Archive
                    </h2>
                    <p className="text-xl md:text-3xl lg:text-5xl font-serif uppercase tracking-widest leading-relaxed text-[#1a1a1a]">
                        {text}
                        <span className="inline-block w-[0.5em] h-[1em] bg-[var(--color-plasma)] ml-2 align-middle" />
                    </p>
                </div>
            </div>
        </section>
    );
}
