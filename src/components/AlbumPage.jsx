import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const albums = [
    { id: 1, title: "Pablo Honey", year: "1993", image: "/pablo honey.png", wikiTitle: "Pablo_Honey" },
    { id: 2, title: "The Bends", year: "1995", image: "/the bends.png", wikiTitle: "The_Bends" },
    { id: 3, title: "OK Computer", year: "1997", image: "/ok computer.png", wikiTitle: "OK_Computer" },
    { id: 4, title: "Kid A", year: "2000", image: "/kid a.png", wikiTitle: "Kid_A" },
    { id: 5, title: "Amnesiac", year: "2001", image: "/amnesiac.png", wikiTitle: "Amnesiac_(album)" },
    { id: 6, title: "Hail to the Thief", year: "2003", image: "/hail to the theif.png", wikiTitle: "Hail_to_the_Thief" },
    { id: 7, title: "In Rainbows", year: "2007", image: "/in rainbows.png", wikiTitle: "In_Rainbows" },
    { id: 8, title: "The King of Limbs", year: "2011", image: "/the king of limbs.png", wikiTitle: "The_King_of_Limbs" },
    { id: 9, title: "A Moon Shaped Pool", year: "2016", image: "/moon Shaped Pool.png", wikiTitle: "A_Moon_Shaped_Pool" },
];

export default function AlbumPage() {
    const { id } = useParams();
    const [story, setStory] = useState("Loading archive entry...");
    const [loading, setLoading] = useState(true);

    const album = albums.find(a => a.id === parseInt(id));

    useEffect(() => {
        if (!album) return;
        setLoading(true);
        fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exsentences=8&exlimit=1&titles=${album.wikiTitle}&explaintext=1&format=json&origin=*`)
            .then(res => res.json())
            .then(data => {
                const pages = data.query.pages;
                const pageId = Object.keys(pages)[0];
                if (pageId !== "-1" && pages[pageId].extract) {
                    setStory(pages[pageId].extract);
                } else {
                    setStory("Archival information currently unavailable or classified.");
                }
            })
            .catch(() => setStory("Error retrieving archival data."))
            .finally(() => setLoading(false));
    }, [album]);

    if (!album) {
        return <div className="h-screen w-screen flex items-center justify-center text-white bg-black">Album Not Found. <Link to="/">Return to Exhibit</Link></div>;
    }

    return (
        <section className="min-h-screen w-full relative bg-cover bg-center bg-fixed text-white" style={{ backgroundImage: `url('${album.image}')` }}>
            <div className="absolute inset-0 bg-black/80"></div>
            
            <div className="relative z-10 container mx-auto px-6 py-20 min-h-screen flex flex-col items-center">
                <Link to="/" className="self-start mb-12 hover:opacity-70 transition-opacity flex items-center gap-2">
                    <span className="font-serif italic text-lg text-[var(--color-plasma)]">&larr; Return to Exhibition</span>
                </Link>

                <div className="max-w-4xl w-full museum-frame bg-[#1a1a1a]/90 border border-[#d4af37]/30 backdrop-blur-md text-[#f8f5eb] shadow-2xl p-8 md:p-16">
                    <div className="text-center mb-12 border-b border-[#d4af37]/20 pb-8">
                        <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter title-serif mb-4 text-[#d4af37]">{album.title}</h1>
                        <p className="font-sans text-sm tracking-[0.3em] opacity-60">CATALOG YEAR: {album.year}</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-12">
                        <div className="w-full md:w-1/3 shrink-0">
                            <div className="aspect-square bg-cover bg-center shadow-lg border border-white/10" style={{ backgroundImage: `url('${album.image}')` }}></div>
                        </div>
                        
                        <div className="w-full md:w-2/3">
                            <h3 className="text-[var(--color-plasma)] font-serif italic mb-4 text-xl border-l-2 border-[var(--color-plasma)] pl-4">Archival Background</h3>
                            <p className="font-sans leading-relaxed text-sm md:text-base opacity-90 text-justify">
                                {loading ? "Decrypting archival records..." : story}
                            </p>

                            <div className="mt-12">
                                <h3 className="text-[var(--color-plasma)] font-serif italic mb-4 text-xl border-l-2 border-[var(--color-plasma)] pl-4">Tracklist Records</h3>
                                <ul className="font-mono text-xs opacity-70 flex flex-col gap-2">
                                    <li className="flex justify-between border-b border-white/10 pb-1"><span>01. PRIMARY DATA</span> <span>[04:23]</span></li>
                                    <li className="flex justify-between border-b border-white/10 pb-1"><span>02. CORRUPTED FILE</span> <span>[03:45]</span></li>
                                    <li className="flex justify-between border-b border-white/10 pb-1"><span>03. PARANOIA PROTOCOL</span> <span>[06:12]</span></li>
                                    <li className="flex justify-between border-b border-white/10 pb-1"><span>04. SYSTEM REBOOT</span> <span>[05:05]</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
