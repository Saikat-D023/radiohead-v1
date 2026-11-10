import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const albums = [
    { title: "Pablo Honey", image: "/pablo honey.png", url: "https://open.spotify.com/album/3gBVdu4a1MMJVMy6vwPEb8" },
    { title: "The Bends", image: "/the bends.png", url: "https://open.spotify.com/album/35UJLpClj5EDrhpNIi4DFg" },
    { title: "OK Computer", image: "/ok computer.png", url: "https://open.spotify.com/album/6dVIqQ8qmQ5GBnJ9shOYGE" },
    { title: "Kid A", image: "/kid a.png", url: "https://open.spotify.com/album/6GjwtEZcfenmOf6l18N7T7" },
    { title: "Amnesiac", image: "/amnesiac.png", url: "https://open.spotify.com/album/1HrMmB5useeZ0F5lHrMvl0" },
    { title: "Hail to the Thief", image: "/hail to the theif.png", url: "https://open.spotify.com/album/5mzoI3VH0ZWk1pLFR6RoYy" },
    { title: "In Rainbows", image: "/in rainbows.png", url: "https://open.spotify.com/album/5vkqYmiPBYLaalcmjujWxK" },
    { title: "The King of Limbs", image: "/the king of limbs.png", url: "https://open.spotify.com/album/3P17levwUPzmFfLYdAK3A7" },
    { title: "A Moon Shaped Pool", image: "/moon Shaped Pool.png", url: "https://open.spotify.com/album/2ix8vWvvSp2Yo7rKMiWpkg" }
];

export default function Discography() {
    return (
        <section id="eras" className="h-screen w-screen flex-shrink-0 snap-center relative overflow-hidden bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: 'url("/kid a.png")' }}>
            <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>
            
            <div className="absolute top-12 left-12 z-20 museum-placard max-w-sm">
                <h2 className="title-serif text-2xl tracking-widest uppercase">The Discography Archive</h2>
                <p className="font-sans text-sm italic mt-2">Chronological Soundscapes</p>
            </div>

            <div className="relative z-10 w-full h-[60vh] flex overflow-x-auto snap-x snap-mandatory gap-12 px-[10vw] items-center pb-8" style={{ scrollbarWidth: 'none' }}>
                {albums.map((album, i) => (
                    <a key={i} href={album.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 snap-center museum-frame w-[60vw] md:w-[35vw] lg:w-[25vw] aspect-square relative group block transition-transform duration-500 hover:-translate-y-4">
                        <div
                            className="absolute inset-4 bg-cover bg-center bg-no-repeat filter grayscale-[50%] sepia-[20%] transition-all duration-700 group-hover:grayscale-0 group-hover:sepia-0"
                            style={{ backgroundImage: `url('${album.image}')` }}
                        />
                        <div className="absolute -bottom-16 left-0 right-0 text-center bg-[#f8f5eb] border border-[#d4af37] px-4 py-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <h3 className="font-bold text-sm uppercase tracking-tighter title-serif text-[#1a1a1a]">{album.title}</h3>
                            <div className="font-sans text-[10px] tracking-widest text-[#4a4a4a] uppercase mt-1">Exhibit A_{String((i + 1)).padStart(2, '0')}</div>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}
