import React, { useEffect, useState } from 'react';

// "[01:04.03]The bottom of the sea" → { time: 64.03, text }. Tag lines like [ar: …] are skipped
function parseLrc(source) {
    const lines = [];
    for (const row of source.split(/\r?\n/)) {
        const match = row.match(/^\[(\d+):(\d+(?:\.\d+)?)\](.*)$/);
        if (match) lines.push({ time: Number(match[1]) * 60 + Number(match[2]), text: match[3].trim() });
    }
    return lines.sort((a, b) => a.time - b.time);
}

// Sings along with whatever `getAudio` returns (null while muted or on another track),
// reading its clock every frame so pauses, seeks and loops stay in step
export default function Lyrics({ src, title, getAudio }) {
    const [lines, setLines] = useState([]);
    const [index, setIndex] = useState(-1);
    const [previous, setPrevious] = useState(-1);

    useEffect(() => {
        let alive = true;
        fetch(src)
            .then((res) => (res.ok ? res.text() : ''))
            .then((text) => { if (alive) setLines(parseLrc(text)); })
            .catch(() => { /* no lyrics, no karaoke */ });
        return () => { alive = false; };
    }, [src]);

    useEffect(() => {
        if (!lines.length) return undefined;
        let raf = 0;
        let shown = -1;
        const frame = () => {
            const audio = getAudio();
            let next = -1;
            if (audio && !audio.paused) {
                for (let i = lines.length - 1; i >= 0; i--) {
                    if (lines[i].time <= audio.currentTime) {
                        next = lines[i].text ? i : -1;
                        break;
                    }
                }
            }
            if (next !== shown) {
                setPrevious(shown);
                setIndex(next);
                shown = next;
            }
            raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(raf);
    }, [lines, getAudio]);

    const line = lines[index];
    const old = lines[previous];

    return (
        <div
            className={`fixed inset-x-0 bottom-24 md:bottom-12 z-[150] flex justify-center px-6 pointer-events-none transition-opacity duration-700 ${line ? 'opacity-100' : 'opacity-0'}`}
            aria-live="polite"
        >
            <div className="relative max-w-[min(92vw,56rem)] rounded-[28px] bg-black/45 backdrop-blur-md border border-white/10 px-6 md:px-10 py-4 md:py-5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
                <p className="font-mono text-[9px] md:text-[10px] tracking-[0.35em] uppercase text-[#9fe6ff]/70">♪ {title}</p>
                <div className="relative mt-1.5 min-h-[1.2em] title-serif italic text-2xl md:text-4xl leading-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.6)]">
                    {old && previous !== index && (
                        <p key={`out-${previous}`} className="lyric-out absolute inset-x-0 top-0" aria-hidden="true">{old.text}</p>
                    )}
                    {line && (
                        <p key={index}>
                            {line.text.split(' ').map((word, i) => (
                                <span key={i} className="lyric-word inline-block" style={{ animationDelay: `${i * 70}ms` }}>
                                    {word}&nbsp;
                                </span>
                            ))}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
