import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

import { Link } from 'react-router-dom';

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

    useGSAP(() => {
        let mm = gsap.matchMedia();

        mm.add({
            isDesktop: "(min-width: 768px)",
            isMobile: "(max-width: 767px)"
        }, (context) => {
            let { isMobile } = context.conditions;

            const ringX = isMobile ? 110 : 400;
            const ringY = isMobile ? 150 : 300;
            const gridX = isMobile ? 110 : 350;
            const gridY = isMobile ? 120 : 350;
            const scaleSize = isMobile ? 0.75 : 1;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: '+=200%',
                    scrub: 1,
                    pin: true,
                }
            });

            gsap.set(cardsRef.current, {
                position: 'absolute',
                top: '50%',
                left: '50%',
                xPercent: -50,
                yPercent: -50,
                rotation: i => (i - 4) * 8,
                z: i => i * -20,
                scale: 1
            });

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
                .to({}, { duration: 0.5 })
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
        
        // Add overlap parallax effect for this section when leaving
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
        <section id="albums" ref={containerRef} className="h-screen w-screen relative overflow-hidden bg-cover bg-center z-10" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop")' }}>
            <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>
            
            <div className="absolute top-12 w-full text-center z-10 museum-placard max-w-sm mx-auto left-0 right-0">
                <h2 className="title-serif text-xl tracking-widest uppercase">The Album Collection</h2>
                <p className="font-sans text-xs italic mt-2">Interactive Archive</p>
            </div>

            <div className="w-full h-full relative" style={{ perspective: '1200px' }}>
                {albums.map((album, i) => (
                    <Link
                        to={`/album/${album.id}`}
                        key={album.id}
                        ref={el => cardsRef.current[i] = el}
                        className="museum-frame transition-transform duration-300 hover:z-50 hover:scale-110 group absolute block"
                        style={{ width: '200px', height: '240px' }}
                    >
                        <div
                            className="w-full h-36 bg-cover bg-center bg-no-repeat opacity-90 group-hover:opacity-100"
                            style={{ backgroundImage: `url('${album.image}')` }}
                        />
                        <div className="mt-3 text-center">
                            <h3 className="font-bold text-xs uppercase tracking-tighter title-serif text-[#1a1a1a]">{album.title}</h3>
                            <p className="font-sans text-[10px] italic text-[#4a4a4a]">{album.year}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
