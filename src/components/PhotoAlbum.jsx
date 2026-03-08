import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const albums = [
    { id: 1, title: "Pablo Honey", year: "1993", image: "/pablo honey.png" },
    { id: 2, title: "The Bends", year: "1995", image: "/the bends.png" },
    { id: 3, title: "OK Computer", year: "1997", image: "/ok computer.png" },
    { id: 4, title: "Kid A", year: "2000", image: "/kid a.png" },
    { id: 5, title: "Amnesiac", year: "2001", image: "/amnesiac.png" },
    { id: 6, title: "Hail to the Thief", year: "2003", image: "/hail to the theif.png" },
    { id: 7, title: "In Rainbows", year: "2007", image: "/in rainbows.png" },
    { id: 8, title: "The King of Limbs", year: "2011", image: "/the king of limbs.png" },
    { id: 9, title: "A Moon Shaped Pool", year: "2016", image: "/moon Shaped Pool.png" },
];

export default function PhotoAlbum() {
    const containerRef = useRef(null);
    const cardsRef = useRef([]);

    useEffect(() => {
        let mm = gsap.matchMedia();

        mm.add({
            isDesktop: "(min-width: 768px)",
            isMobile: "(max-width: 767px)"
        }, (context) => {
            let { isMobile } = context.conditions;

            // Dynamics sizing based on screen breakpoints to fit 9-cards cleanly
            const ringX = isMobile ? 110 : 400;
            const ringY = isMobile ? 150 : 300;
            const gridX = isMobile ? 110 : 350;
            const gridY = isMobile ? 120 : 350;
            const scaleSize = isMobile ? 0.75 : 1;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: '+=300%',
                    scrub: 1,
                    pin: true,
                }
            });

            // Initial state: pile
            gsap.set(cardsRef.current, {
                position: 'absolute',
                top: '50%',
                left: '50%',
                xPercent: -50,
                yPercent: -50,
                rotation: i => (i - 4) * 8, // slight fan
                z: i => i * -20,
                scale: 1 // Start actual size and then animate scale for mobile later to prevent jitter
            });

            // Animate out to a rotating ring
            tl.to(cardsRef.current, {
                x: i => Math.sin(i * Math.PI * 2 / 9) * ringX,
                y: i => Math.cos(i * Math.PI * 2 / 9) * ringY,
                rotation: i => -i * 40,
                scale: scaleSize,
                z: 0,
                stagger: 0.05,
                ease: 'power1.inOut',
                duration: 1
            })
                // small pause in the ring
                .to({}, { duration: 0.5 })
                // Animate out to a clean grid
                .to(cardsRef.current, {
                    x: i => (i % 3 - 1) * gridX,
                    y: i => (Math.floor(i / 3) - 1) * gridY,
                    rotation: 0,
                    scale: scaleSize,
                    stagger: 0.05,
                    ease: 'power3.inOut',
                    duration: 1.5
                });
        });

        return () => mm.revert();
    }, []);

    return (
        <section id="albums" ref={containerRef} className="h-screen w-full relative overflow-hidden bg-[var(--color-void)] z-10">
            <div className="absolute top-20 w-full text-center tracking-widest font-mono text-[var(--color-plasma)] text-xs uppercase opacity-70">
                <h2>Initiate Protocol_Archive.01</h2>
            </div>
            <div className="w-full h-full relative" style={{ perspective: '1200px' }}>
                {albums.map((album, i) => (
                    <div
                        key={album.id}
                        ref={el => cardsRef.current[i] = el}
                        className={`w-36 h-36 md:w-72 md:h-72 flex flex-col justify-end p-4 md:p-6 shadow-2xl transition-transform duration-300 absolute cursor-pointer hover:z-50 border border-white/5 opacity-90 hover:opacity-100 hover:scale-110 bg-black overflow-hidden group`}
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 ease-out group-hover:scale-110 opacity-70 group-hover:opacity-100"
                            style={{ backgroundImage: `url('${album.image}')` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent z-10 pointer-events-none"></div>
                        <div className="relative z-20 pointer-events-none">
                            <h3 className="font-bold text-lg md:text-3xl uppercase tracking-tighter leading-none mb-1 text-white">{album.title}</h3>
                            <p className="font-mono text-[10px] md:text-sm tracking-widest text-white/60">{album.year}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
