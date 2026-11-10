import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const erasData = [
    {
        id: "rock",
        title: "The Alternative Rock Era",
        years: "1993 - 1997",
        image: "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1920&auto=format&fit=crop",
        description: "In their early years, Radiohead defined the post-grunge British alternative rock sound. From the distorted angst of 'Creep' to the expansive, arena-ready anthems of 'The Bends' and the progressive guitar orchestrations of 'OK Computer', this era cemented them as rock pioneers. They utilized traditional rock instrumentation—three guitars, bass, and drums—but pushed the boundaries of the genre with complex arrangements and existential lyrical themes."
    },
    {
        id: "electronic",
        title: "The Electronic Evolution",
        years: "2000 - 2003",
        image: "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=1920&auto=format&fit=crop",
        description: "Following the massive success of 'OK Computer', the band experienced a profound creative shift. 'Kid A' and 'Amnesiac' largely abandoned conventional rock structures in favor of electronic landscapes, drawing heavily from IDM, jazz, and 20th-century classical music. Synthesizers, drum machines, Ondes Martenot, and heavy digital manipulation became the primary tools, alienating some early fans but establishing Radiohead as fearless sonic innovators."
    },
    {
        id: "artrock",
        title: "The Art Rock Synthesis",
        years: "2007 - Present",
        image: "https://images.unsplash.com/photo-1618172193763-c511deb635ca?q=80&w=1920&auto=format&fit=crop",
        description: "In their later periods, starting notably with 'In Rainbows', Radiohead found a harmonious synthesis of their acoustic rock roots and their electronic experimentation. This era is characterized by warmer production, complex polyrhythms, lush string arrangements by Jonny Greenwood, and a more organic integration of digital effects. The music became both more intimate and more sophisticated, representing a mature, masterful phase of their career."
    }
];

export default function Eras() {
    const containerRef = useRef(null);
    const sectionsRef = useRef([]);

    useGSAP(() => {
        sectionsRef.current.forEach((section) => {
            if (section) {
                gsap.to(section, {
                    yPercent: 30,
                    ease: "none",
                    scrollTrigger: {
                        trigger: section,
                        start: "top top",
                        end: "bottom top",
                        scrub: true
                    }
                });
            }
        });
    }, { scope: containerRef });

    return (
        <div ref={containerRef}>
            {erasData.map((era, index) => (
                <section 
                    key={era.id} 
                    ref={el => sectionsRef.current[index] = el}
                    className="h-screen w-full relative overflow-hidden bg-cover bg-center flex items-center justify-center z-20" 
                    style={{ backgroundImage: `url('${era.image}')` }}
                >
                    <div className="absolute inset-0 bg-black/70 pointer-events-none"></div>

                    <div className="absolute top-12 left-12 z-20 museum-placard max-w-sm">
                        <h2 className="title-serif text-xl tracking-widest uppercase">Genre Evolution</h2>
                        <p className="font-sans text-xs italic mt-2">Era 0{index + 1}: {era.years}</p>
                    </div>

                    <div className="max-w-4xl mx-auto w-full relative z-10 px-8 flex flex-col md:flex-row gap-12 items-center">
                        <div className="w-full md:w-1/2">
                            <div className="museum-frame transition-transform duration-500 hover:scale-105">
                                <div className="aspect-square bg-cover bg-center filter grayscale-[30%] sepia-[10%] hover:grayscale-0 hover:sepia-0 transition-all duration-700" style={{ backgroundImage: `url('${era.image}')` }}></div>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 bg-[#1a1a1a]/90 border border-[#d4af37]/30 backdrop-blur-md p-8 shadow-2xl text-[#f8f5eb]">
                            <h3 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter title-serif mb-6 text-[#d4af37]">
                                {era.title}
                            </h3>
                            <div className="w-12 h-1 bg-[var(--color-plasma)] mb-6"></div>
                            <p className="font-sans leading-relaxed text-sm md:text-base opacity-90 text-justify">
                                {era.description}
                            </p>
                        </div>
                    </div>
                </section>
            ))}
        </div>
    );
}
