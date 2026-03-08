import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const albums = [
    { title: "Pablo Honey", image: "/pablo honey.png" },
    { title: "The Bends", image: "/the bends.png" },
    { title: "OK Computer", image: "/ok computer.png" },
    { title: "Kid A", image: "/kid a.png" },
    { title: "Amnesiac", image: "/amnesiac.png" },
    { title: "Hail to the Thief", image: "/hail to the theif.png" },
    { title: "In Rainbows", image: "/in rainbows.png" },
    { title: "The King of Limbs", image: "/the king of limbs.png" },
    { title: "A Moon Shaped Pool", image: "/moon Shaped Pool.png" }
];

export default function Discography() {
    const containerRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            const cards = gsap.utils.toArray('.stack-card');

            cards.forEach((card, i) => {
                ScrollTrigger.create({
                    trigger: card,
                    start: `top top+=${80 + i * 30}`,
                    endTrigger: containerRef.current,
                    end: 'bottom bottom',
                    pin: true,
                    pinSpacing: false,
                    scrub: 1,
                });
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="pb-[40vh] bg-[var(--color-void)] pt-32 px-4 md:px-20 z-30 relative">
            <h2 className="text-4xl md:text-6xl font-black uppercase mb-12 text-center tracking-widest text-white/20">The Stack</h2>
            <div className="max-w-4xl mx-auto relative h-full">
                {albums.map((album, i) => (
                    <div key={i} className="stack-card w-full h-[50vh] md:h-[65vh] rounded-3xl overflow-hidden mb-8 shadow-2xl relative flex items-center justify-center bg-black border border-white/10 group">

                        {/* Background Image Image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 ease-out group-hover:scale-105 opacity-60 group-hover:opacity-40 grayscale group-hover:grayscale-0"
                            style={{ backgroundImage: `url('${album.image}')` }}
                        />

                        {/* Gradients & Textures */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 z-10"></div>
                        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSIjRkZGIi8+Cjwvc3ZnPg==')] z-0 mix-blend-overlay"></div>

                        {/* Title & Index */}
                        <h3 className="relative z-20 text-4xl md:text-7xl lg:text-9xl font-black uppercase tracking-tighter text-white/90 text-center px-4 drop-shadow-2xl">{album.title}</h3>
                        <div className="absolute bottom-6 right-8 font-mono text-sm tracking-widest z-20 text-white/60 drop-shadow-md bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">LP_{String((i + 1)).padStart(2, '0')}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}
