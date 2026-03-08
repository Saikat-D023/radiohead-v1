import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Philosophy() {
    const [text, setText] = useState('');
    const fullText = "THIS IS THE RADIOHEAD PUBLIC BROADCAST SYSTEM. WE ARE NOT SCAREMONGERING. THIS IS REALLY HAPPENING. EVERYONE IS BROKEN. EVERYTHING IS BROKEN.";
    const containerRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
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
        }, containerRef);
        return () => ctx.revert();
    }, [fullText]);

    return (
        <section id="philosophy" ref={containerRef} className="py-32 px-6 md:px-20 bg-black border-y border-white/10 z-30 relative min-h-[60vh] flex items-center">
            <div className="max-w-5xl mx-auto w-full">
                <h2 className="text-xl md:text-2xl text-[var(--color-plasma)] font-mono uppercase tracking-widest mb-12 animate-pulse flex items-center gap-4">
                    <span className="w-3 h-3 bg-[var(--color-plasma)] inline-block animate-ping"></span>
                    Terminal_Access.log
                </h2>
                <p className="text-2xl md:text-5xl lg:text-7xl font-mono uppercase tracking-tighter leading-tight relative text-white/90">
                    {text}
                    <span className="inline-block w-[0.5em] h-[1em] bg-[var(--color-plasma)] ml-2 animate-pulse align-middle" />
                </p>
            </div>
        </section>
    );
}
