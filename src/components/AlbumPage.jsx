import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { findAlbum, fmt } from '../data/descent';

// An album's file, read at the depth it was found: the page takes the water colour,
// light and glow of its zone
export default function AlbumPage() {
    const { id } = useParams();
    const found = findAlbum(parseInt(id, 10));
    const wikiTitle = found?.album.wikiTitle;
    // The story is kept with the album it belongs to, so a new album reads as loading
    const [entry, setEntry] = useState({ wikiTitle: null, story: '' });
    const loading = entry.wikiTitle !== wikiTitle;
    const story = entry.story;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (!wikiTitle) return;
        const done = (text) => setEntry({ wikiTitle, story: text });
        fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exsentences=8&exlimit=1&titles=${wikiTitle}&explaintext=1&format=json&origin=*`)
            .then(res => res.json())
            .then(data => {
                const pages = data.query.pages;
                const pageId = Object.keys(pages)[0];
                if (pageId !== "-1" && pages[pageId].extract) {
                    done(pages[pageId].extract);
                } else {
                    done("Archival information currently unavailable or classified.");
                }
            })
            .catch(() => done("Error retrieving archival data."));
    }, [wikiTitle]);

    if (!found) {
        return (
            <div className="h-screen w-screen flex flex-col gap-4 items-center justify-center text-white bg-[#04121f]">
                <p className="title-serif text-3xl">Nothing found at this depth.</p>
                <Link to="/" className="font-mono text-xs tracking-[0.3em] uppercase text-[#9fe6ff]">Back to the surface</Link>
            </div>
        );
    }

    const { album, zone } = found;
    const glow = zone.glow || '190,240,255';
    const sunlit = !zone.glow;

    return (
        <section
            className="min-h-screen w-full relative overflow-hidden text-white"
            style={{ background: `linear-gradient(${zone.colors[0]}, ${zone.colors[1]})` }}
        >
            {/* Light from above in the shallows, the cover's own glow down deep */}
            {sunlit ? (
                <div className="absolute inset-x-0 top-0 h-[120vh] pointer-events-none mix-blend-screen" aria-hidden="true">
                    {[10, 34, 58, 80].map((left, i) => (
                        <div
                            key={left}
                            className="light-ray absolute top-0 h-full w-24 md:w-40 origin-top"
                            style={{ left: `${left}%`, animationDelay: `${i * -1.7}s`, background: 'linear-gradient(rgba(220,245,255,0.18), rgba(220,245,255,0))' }}
                        />
                    ))}
                </div>
            ) : (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: `radial-gradient(700px circle at 30% 35%, rgba(${glow},0.14), transparent 70%)` }}
                    aria-hidden="true"
                />
            )}

            <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24">
                <Link
                    to="/"
                    className="inline-flex items-center gap-3 font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/70 hover:text-white transition-colors"
                >
                    <span aria-hidden="true">↑</span> Back to {fmt(album.depth)} m
                </Link>

                <div className="flex items-center gap-4 mt-12 font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/50">
                    <span>{zone.name} · {fmt(album.depth)} m</span>
                    <span className="flex-1 border-t border-dashed border-white/30" />
                    <span className="hidden md:inline">{zone.era}</span>
                </div>

                <div className="mt-10 md:mt-14 flex flex-col md:flex-row gap-10 md:gap-16 items-center md:items-start">
                    <div className="w-64 md:w-[22rem] shrink-0 md:sticky md:top-24">
                        <div
                            className="aspect-square bg-cover bg-center rounded-sm"
                            style={{
                                backgroundImage: `url('${album.image}')`,
                                boxShadow: sunlit ? '0 24px 60px rgba(0,30,40,0.4)' : `0 0 70px rgba(${glow},0.35), 0 0 0 1px rgba(${glow},0.4)`,
                            }}
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs tracking-[0.3em] text-white/50">{album.year}</p>
                        <h1 className="title-serif text-5xl md:text-7xl leading-none mt-2">{album.title}</h1>
                        <p className="title-serif italic text-lg md:text-xl text-white/70 mt-4">{zone.title}</p>

                        <div className="water-tip p-6 md:p-8 mt-10">
                            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#bfefff]/70">From the archive</p>
                            <p className="font-sans text-sm md:text-base leading-relaxed text-white/85 mt-3">
                                {loading ? 'Sounding the archive…' : story}
                            </p>
                            <p className="font-mono text-[10px] tracking-[0.2em] text-white/40 mt-4">Source: Wikipedia</p>
                        </div>

                        <div className="mt-12">
                            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/50">Tracklist</p>
                            <ol className="mt-4 border-t border-white/15">
                                {album.tracks.map((track, i) => {
                                    const key = track.toLowerCase() === album.track.toLowerCase();
                                    return (
                                        <li key={track} className="flex items-baseline gap-4 py-2.5 border-b border-white/10">
                                            <span className="font-mono text-[10px] tracking-[0.2em] text-white/40 w-6 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                                            <span className={`title-serif text-lg ${key ? 'italic text-white' : 'text-white/75'}`}>{track}</span>
                                            {key && (
                                                <span className="ml-auto flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-[#9fe6ff]/80 shrink-0">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#9fe6ff] shadow-[0_0_8px_#9fe6ff]" />
                                                    Key track
                                                </span>
                                            )}
                                        </li>
                                    );
                                })}
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
