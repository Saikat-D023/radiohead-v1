import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import ThomDiver from './ThomDiver';
import KarmaFish from './KarmaFish';
import FoundObject from './FoundObject';
import { MAX_DEPTH, ZONES, fmt, readDive, forgetDive } from '../data/descent';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Who Thom meets on the way down, keyed by zone
const MEMBERS = {
    sunlight: {
        name: 'Jonny Greenwood', image: '/divers/jonny.webp', role: 'Lead guitar · keys · Ondes Martenot', born: 'b. 1971',
        bio: "The youngest member and the band's arranger. Outside Radiohead he scores films for Paul Thomas Anderson, There Will Be Blood and Phantom Thread among them. He brought spare scuba gear.",
        gives: 'scuba',
    },
    twilight: {
        name: 'Colin Greenwood', image: '/divers/colin.webp', role: 'Bass guitar', born: 'b. 1969',
        bio: "Jonny's older brother, and the bassist since the band formed as On a Friday at Abingdon School. The light is going, so he brought you goggles.",
        gives: 'goggles',
    },
    midnight: {
        name: "Ed O'Brien", image: '/divers/ed.webp', role: 'Guitar · effects · backing vocals', born: 'b. 1968',
        bio: 'Plays guitar like weather: sustain, loops and texture instead of riffs. Released the solo album Earth in 2020 as EOB. It gets cold down here, so he brought a hood.',
        gives: 'cap',
    },
    abyssal: {
        name: 'Philip Selway', image: '/divers/phil.webp', role: 'Drums · percussion', born: 'b. 1967',
        bio: "The band's drummer and steadiest pulse. Also a solo artist, with records including Familial and Strange Dance. He brought the regulator: you'll want to breathe from here on.",
        gives: 'regulator',
    },
    hadal: {
        name: 'Thom Yorke, 1993', image: '/divers/young-thom.webp', role: 'Vocals · guitar · piano', born: 'b. 1968',
        bio: "Bleached hair, Pablo Honey years, still singing 'Creep' every night. At the bottom of the trench you meet the version of yourself who started the dive. Nothing reaches this deep, so he brought you a light.",
        gives: 'light',
    },
};

// Thom's outfit level after receiving each item (0 is no gear); matches ThomDiver's images
const GEAR_LEVEL = { scuba: 1, goggles: 2, cap: 3, regulator: 4, light: 5 };

// Where Thom's feet go on the diving board, in /surface.webp pixels
const SURFACE_IMAGE = { width: 1746, height: 890, posX: 0.3, posY: 1 };
const BOARD_FEET = { x: 640, y: 646 };
const SEA_LEVEL_Y = 598;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const round = (n) => Math.round(n * 10) / 10;

// Centre of an element in the dive's own coordinates, from layout offsets so the
// bobbing and reveal transforms don't make the route wobble
function localCentre(el, root) {
    let x = el.offsetWidth / 2;
    let y = el.offsetHeight / 2;
    for (let n = el; n && n !== root; n = n.offsetParent) {
        x += n.offsetLeft;
        y += n.offsetTop;
    }
    return { x, y };
}

// Between stops the route swings across the page, and through the longest gaps
// it throws in a loop, Framer-scroll style
function weave(stops, width) {
    const points = [];
    const stopAt = [];
    stops.forEach((p, i) => {
        if (i) {
            const a = stops[i - 1];
            const gap = p.y - a.y;
            const cx = clamp(width - (a.x + p.x) / 2, width * 0.15, width * 0.85);
            const cy = (a.y + p.y) / 2;
            if (gap > 1200 && i % 2 === 0) {
                const r = clamp(width * 0.1, 60, 150);
                points.push({ x: cx + r, y: cy }, { x: cx, y: cy - r }, { x: cx - r, y: cy }, { x: cx + r * 0.2, y: cy + r });
            } else if (gap > 400) {
                points.push({ x: cx, y: cy });
            }
        }
        stopAt.push(points.length);
        points.push(p);
    });
    return { points, stopAt };
}

// Maps a point in an object-cover image to section-local pixels
function coverPoint(image, sectionW, sectionH, x, y) {
    const { width, height, posX, posY } = image;
    const scale = Math.max(sectionW / width, sectionH / height);
    return {
        x: (sectionW - width * scale) * posX + x * scale,
        y: (sectionH - height * scale) * posY + y * scale,
    };
}

function CapGear() {
    return (
        <svg viewBox="0 0 64 56" className="w-full h-full drop-shadow-[0_0_12px_rgba(159,230,255,0.5)]">
            <path d="M6 44 C 4 14, 20 2, 32 2 C 44 2, 60 14, 58 44 C 50 38, 14 38, 6 44 Z" fill="#16191b" />
            <path d="M32 3 V 39 M18 7 C 14 18, 13 30, 14 40 M46 7 C 50 18, 51 30, 50 40" stroke="#5c6266" strokeWidth="1" strokeDasharray="2 2" fill="none" />
            <path d="M24 18 q 8 -4 16 0 M24 22 q 8 -4 16 0" stroke="#8a9094" strokeWidth="1.6" fill="none" />
            <circle cx="20" cy="14" r="1.5" fill="#cfe6ee" opacity="0.6" />
            <circle cx="43" cy="26" r="1.2" fill="#cfe6ee" opacity="0.6" />
        </svg>
    );
}

function RegulatorGear() {
    return (
        <svg viewBox="0 0 72 56" className="w-full h-full drop-shadow-[0_0_12px_rgba(159,230,255,0.5)]">
            <path d="M4 52 C 4 30, 10 24, 26 24" stroke="#f2c200" strokeWidth="5" fill="none" strokeLinecap="round" />
            <rect x="24" y="20" width="12" height="8" rx="2" fill="#9aa3a8" />
            <circle cx="48" cy="24" r="16" fill="#1b1f22" stroke="#6d777c" strokeWidth="3" />
            <circle cx="48" cy="24" r="9" fill="#2a3033" />
            <path d="M42 22 q 6 -4 12 0 M42 26 q 6 -4 12 0" stroke="#f2c200" strokeWidth="2" fill="none" />
            <rect x="62" y="20" width="8" height="8" rx="2" fill="#2a3033" />
        </svg>
    );
}

function LightGear() {
    return (
        <svg viewBox="0 0 72 40" className="w-full h-full drop-shadow-[0_0_16px_rgba(255,236,190,0.7)]">
            <path d="M2 22 H 70" stroke="#1b1f22" strokeWidth="6" />
            <path d="M6 22 H 66" stroke="#3d4549" strokeWidth="1" strokeDasharray="3 3" />
            <rect x="20" y="8" width="32" height="26" rx="7" fill="#1b1f22" stroke="#5c6266" strokeWidth="1.5" />
            <circle cx="33" cy="21" r="9" fill="#fff4d6" />
            <circle cx="33" cy="21" r="5" fill="#ffffff" />
            <circle cx="46" cy="21" r="2.2" fill="#ff3b30" />
        </svg>
    );
}

function GogglesGear() {
    return (
        <svg viewBox="0 0 64 40" className="w-full h-full drop-shadow-[0_0_12px_rgba(159,230,255,0.5)]">
            <path d="M2 18 C 2 8, 62 8, 62 18" stroke="#1b1f22" strokeWidth="4" fill="none" />
            <rect x="6" y="10" width="52" height="24" rx="10" fill="#1b1f22" />
            <rect x="10" y="14" width="20" height="16" rx="6" fill="#bfe9f5" opacity="0.8" />
            <rect x="34" y="14" width="20" height="16" rx="6" fill="#bfe9f5" opacity="0.8" />
            <path d="M28 30 Q 32 24 36 30" fill="#1b1f22" />
            <circle cx="15" cy="18" r="2" fill="#fff" opacity="0.8" />
            <circle cx="39" cy="18" r="2" fill="#fff" opacity="0.8" />
        </svg>
    );
}

function ScubaGear() {
    return (
        <svg viewBox="0 0 64 80" className="w-full h-full drop-shadow-[0_0_12px_rgba(159,230,255,0.5)]">
            <defs>
                <linearGradient id="tank" x1="0" x2="1">
                    <stop offset="0" stopColor="#6d7a80" />
                    <stop offset="0.45" stopColor="#e3eaec" />
                    <stop offset="1" stopColor="#5d686d" />
                </linearGradient>
            </defs>
            <rect x="30" y="14" width="22" height="62" rx="11" fill="url(#tank)" />
            <rect x="37" y="6" width="8" height="10" fill="#3d4549" />
            <rect x="33" y="2" width="16" height="5" rx="2" fill="#2a3033" />
            <path d="M44 8 C 20 4, 6 20, 14 44" stroke="#f2c200" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <rect x="2" y="40" width="30" height="18" rx="7" fill="#1b1f22" />
            <rect x="5" y="43" width="11" height="12" rx="4" fill="#9fd6e8" opacity="0.75" />
            <rect x="18" y="43" width="11" height="12" rx="4" fill="#9fd6e8" opacity="0.75" />
        </svg>
    );
}

function Encounter({ member, zone, gearRef }) {
    const glow = zone.glow || '190,240,255';
    if (!member) {
        return (
            <div className="reveal flex justify-center mt-16 md:mt-20">
                <div className="water-tip max-w-md p-6 text-center">
                    <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#bfefff]/70">No one else comes this far</p>
                    <p className="title-serif italic text-2xl text-white mt-2">Just you, and the last record.</p>
                </div>
            </div>
        );
    }
    return (
        <div data-encounter={zone.id} className="reveal flex flex-col-reverse md:flex-row items-center md:items-end md:justify-end gap-2 md:gap-0 mt-12 md:mt-16">
            <div className="water-tip w-full max-w-sm p-6 md:mb-24">
                <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#bfefff]/70">You meet</p>
                <p className="title-serif text-3xl text-white mt-1">{member.name}</p>
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/60 mt-1">{member.role} · {member.born}</p>
                <p className="font-sans text-sm text-white/80 mt-3 leading-relaxed">{member.bio}</p>
            </div>

            <div className="hidden md:flex items-end gap-2 mb-28 mx-3" aria-hidden="true">
                <span className="water-dot block w-2 h-2" />
                <span className="water-dot block w-3 h-3" style={{ animationDelay: '-1s' }} />
                <span className="water-dot block w-4 h-4" style={{ animationDelay: '-2s' }} />
            </div>

            <div className="member-bob relative w-48 md:w-64 shrink-0">
                <img
                    src={member.image}
                    alt={member.name}
                    className="w-full [mask-image:linear-gradient(black_72%,transparent)]"
                    style={{ filter: `drop-shadow(0 0 24px rgba(${glow},0.35))` }}
                    draggable="false"
                />
                {member.gives === 'scuba' && (
                    <div ref={gearRef} className="absolute -left-10 md:-left-14 bottom-[22%] w-14 md:w-16 h-20">
                        <ScubaGear />
                    </div>
                )}
                {member.gives === 'goggles' && (
                    <div ref={gearRef} className="absolute -left-12 md:-left-16 bottom-[30%] w-16 md:w-20 h-10 md:h-12">
                        <GogglesGear />
                    </div>
                )}
                {member.gives === 'cap' && (
                    <div ref={gearRef} className="absolute -left-12 md:-left-16 bottom-[30%] w-14 md:w-18 h-12 md:h-16">
                        <CapGear />
                    </div>
                )}
                {member.gives === 'regulator' && (
                    <div ref={gearRef} className="absolute -left-12 md:-left-16 bottom-[30%] w-16 md:w-20 h-12 md:h-14">
                        <RegulatorGear />
                    </div>
                )}
                {member.gives === 'light' && (
                    <div ref={gearRef} className="absolute -left-12 md:-left-16 bottom-[30%] w-16 md:w-20 h-10 md:h-12">
                        <LightGear />
                    </div>
                )}
            </div>
        </div>
    );
}

function AlbumSpecimen({ album, zone, index, stateRef, startOpen }) {
    const flip = index % 2 === 1;
    const glow = zone.glow;
    const textRef = useRef(null);
    // The words surface once the record is out
    const showText = (tl, at) => tl.fromTo(textRef.current, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' }, at);
    return (
        <div data-soundtrack={album.soundtrack} className={`reveal relative flex flex-col md:flex-row items-center gap-6 md:gap-16 py-12 md:py-16 ${flip ? 'md:flex-row-reverse' : ''}`}>
            <div className="absolute left-0 right-0 top-0 flex items-center gap-4 font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/50">
                <span className="w-8 border-t border-white/40" />
                <span>{fmt(album.depth)} m</span>
            </div>

            <FoundObject album={album} zone={zone} stateRef={stateRef} startOpen={startOpen} onOpen={showText} />

            <div ref={textRef} className={`max-w-sm text-center ${flip ? 'md:text-right' : 'md:text-left'} ${startOpen ? '' : 'invisible opacity-0'}`}>
                <p className="font-mono text-xs tracking-[0.3em] text-white/50">{album.year}</p>
                <h3 className="title-serif text-4xl md:text-6xl text-white mt-2 leading-none">{album.title}</h3>
                <div className={`inline-block mt-6 border px-4 py-3 text-left rounded-sm backdrop-blur-sm ${glow ? 'border-white/15 bg-white/5' : 'border-white/30 bg-white/10'}`}>
                    <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/50">Key track</p>
                    <p className="title-serif italic text-lg text-white/90">{album.track}</p>
                </div>
            </div>
        </div>
    );
}

export default function OceanDescent() {
    const rootRef = useRef(null);
    const surfaceRef = useRef(null);
    const seaLevelRef = useRef(null);
    const zoneRefs = useRef([]);
    const canvasRef = useRef(null);
    const torchRef = useRef(null);
    const hudRef = useRef(null);
    const depthRef = useRef(null);
    const zoneNameRef = useRef(null);
    const markerRef = useRef(null);
    const gearRefs = useRef({});
    const karmaRef = useRef(null);
    const fishRef = useRef(null);
    const fishFlipRef = useRef(null);
    const fishSpotRefs = useRef({});
    const verdictRef = useRef(null);
    const karmaSceneRef = useRef(null);
    // Version 2: const highwayRef = useRef(null);
    const routeSvgRef = useRef(null);
    const routeRef = useRef(null);
    const trailRef = useRef(null);
    const trailGlowRef = useRef(null);
    const measureRef = useRef(null);
    const diveState = useRef({ depth: 0, gear: 0, board: null, route: null, eaten: false, pooped: false, mouth: null, lure: null, vent: null, thom: { x: -999, y: -999 }, bubbles: [] });
    // Coming back from an album page: drop the diver back where they left
    const [returning] = useState(readDive);

    useEffect(() => {
        if (!returning) return undefined;
        forgetDive();
        const previous = history.scrollRestoration;
        history.scrollRestoration = 'manual';
        // Layout position, so a cover still mid reveal-animation doesn't throw it off
        const pageTop = (el) => {
            let y = 0;
            for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
            return y;
        };
        const align = () => {
            const card = document.querySelector(`[data-album="${returning.albumId}"]`);
            if (card) window.scrollTo(0, pageTop(card) - returning.top);
            ScrollTrigger.refresh();
        };
        // Once now, and again after late images have settled the layout
        const raf = requestAnimationFrame(align);
        const later = setTimeout(align, 600);
        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(later);
            history.scrollRestoration = previous;
        };
    }, [returning]);

    useGSAP(() => {
        // The Karma Fish patrols its beat: swim right, turn round, swim left, turn back
        const patrol = gsap.timeline({ repeat: -1 })
            .to(fishRef.current, { x: '28vw', duration: 7, ease: 'sine.inOut' })
            .to(fishFlipRef.current, { scaleX: -1, duration: 0.8, ease: 'power2.inOut' })
            .to(fishRef.current, { x: '-28vw', duration: 14, ease: 'sine.inOut' })
            .to(fishFlipRef.current, { scaleX: 1, duration: 0.8, ease: 'power2.inOut' })
            .to(fishRef.current, { x: 0, duration: 7, ease: 'sine.inOut' });

        // It stops to lure Thom in and swallow him; scrolling back up spits him out
        const s = diveState.current;
        ScrollTrigger.create({
            trigger: karmaRef.current,
            start: 'top 20%',
            onEnter: () => {
                s.eaten = true;
                patrol.pause();
            },
            onLeaveBack: () => {
                s.eaten = false;
                patrol.resume();
                gsap.to(verdictRef.current, { opacity: 0, y: 20, duration: 0.4, overwrite: true });
            },
        });
        /* Version 2: at the bottom of the Karma Fish Zone it poops him out the back, gear
           and all gone, and he escapes up to the highway
        ScrollTrigger.create({
            trigger: karmaRef.current,
            start: 'bottom bottom',
            onEnter: () => {
                s.savedGear = s.gear;
                s.gear = 0;
                s.pooped = true;
                patrol.pause();
                gsap.delayedCall(1.6, () => patrol.resume());
                gsap.fromTo(karmaSceneRef.current, { y: -8 }, { y: 0, duration: 0.6, ease: 'elastic.out(1.2, 0.2)' });
                gsap.to(verdictRef.current, { opacity: 0, y: -20, duration: 0.6, overwrite: true });
            },
            onLeaveBack: () => {
                s.gear = s.savedGear ?? s.gear;
                s.pooped = false;
                if (s.eaten) gsap.to(verdictRef.current, { opacity: 1, y: 0, duration: 0.6, overwrite: true });
            },
        });
        */
        s.onSwallow = () => {
            gsap.fromTo(karmaSceneRef.current, { x: -10 }, { x: 0, duration: 0.5, ease: 'elastic.out(1.2, 0.2)' });
            gsap.fromTo(fishSpotRefs.current.flash, { opacity: 0.9, scale: 0.4 }, { opacity: 0, scale: 2.2, duration: 0.9, ease: 'power2.out' });
            // Back on patrol once he's dealt with
            gsap.delayedCall(1.5, () => { if (s.eaten) patrol.resume(); });
            gsap.to(verdictRef.current, { opacity: 1, y: 0, duration: 1, delay: 0.4, ease: 'power3.out', overwrite: true });
        };

        // Jonny hands over the scuba gear, Colin the goggles, young Thom the light: each item flies to
        // wherever Thom is and his picture changes when it lands
        for (const [zoneId, member] of Object.entries(MEMBERS)) {
            if (!member.gives) continue;
            const gear = gearRefs.current[zoneId];
            const level = GEAR_LEVEL[member.gives];
            ScrollTrigger.create({
                trigger: `[data-encounter="${zoneId}"]`,
                start: 'center 60%',
                onEnter: () => {
                    const s = diveState.current;
                    const rect = gear.getBoundingClientRect();
                    gsap.to(gear, {
                        x: `+=${s.thom.x - (rect.left + rect.width / 2)}`,
                        y: `+=${s.thom.y - (rect.top + rect.height / 2)}`,
                        scale: 0.3, rotation: 200, opacity: 0, duration: 0.8, ease: 'power2.in', overwrite: true,
                        onComplete: () => {
                            s.gear = Math.max(s.gear, level);
                            for (let i = 0; i < 18; i++) {
                                s.bubbles.push({ x: s.thom.x + (Math.random() - 0.5) * 60, y: s.thom.y + (Math.random() - 0.5) * 60, r: 2 + Math.random() * 5, vy: 0.8 + Math.random() * 1.6, phase: Math.random() * 6.28, life: 1 });
                            }
                        },
                    });
                },
                onLeaveBack: () => {
                    diveState.current.gear = level - 1;
                    gsap.to(gear, { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, duration: 0.6, ease: 'power2.out', overwrite: true });
                },
            });
        }

        gsap.set('.reveal', { opacity: 0, y: 60, filter: 'blur(8px)' });
        ScrollTrigger.batch('.reveal', {
            start: 'top 85%',
            once: true,
            onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, stagger: 0.12, ease: 'power3.out' }),
        });

        gsap.utils.toArray('[data-soundtrack]').forEach((el) => {
            ScrollTrigger.create({
                trigger: el,
                start: 'top 70%',
                end: 'bottom 30%',
                onToggle: (self) => window.dispatchEvent(new CustomEvent('soundtrack', {
                    detail: self.isActive ? el.dataset.soundtrack : 'main',
                })),
            });
        });
    }, { scope: rootRef });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const snow = [];
        let w = 0;
        let h = 0;
        let depth = 0;
        let lastScroll = window.scrollY;
        let raf = 0;
        let shownDepth = '';
        let boardLocal = { x: 0, y: 0 };

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = window.innerWidth;
            h = window.innerHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            snow.length = 0;
            for (let i = 0; i < (w < 768 ? 50 : 110); i++) {
                snow.push({ x: Math.random() * w, y: Math.random() * h, r: 0.5 + Math.random() * 1.4, z: 0.3 + Math.random() * 0.7, drift: Math.random() * 6.28 });
            }

            const sw = surfaceRef.current.clientWidth;
            const sh = surfaceRef.current.clientHeight;
            boardLocal = coverPoint(SURFACE_IMAGE, sw, sh, BOARD_FEET.x, BOARD_FEET.y);
            seaLevelRef.current.style.top = `${coverPoint(SURFACE_IMAGE, sw, sh, 0, SEA_LEVEL_Y).y}px`;
        };

        // Depth at the middle of the viewport, interpolated within whichever zone it falls in
        const measureDepth = () => {
            const center = window.innerHeight / 2;
            // Version 2: back on dry land
            // if (center >= highwayRef.current.getBoundingClientRect().top) return { depth: 0, zone: 'Hartford, CT', land: true };
            if (center >= karmaRef.current.getBoundingClientRect().top) return { depth: MAX_DEPTH, zone: 'Karma Fish Zone' };
            for (let i = ZONES.length - 1; i >= 0; i--) {
                const rect = zoneRefs.current[i].getBoundingClientRect();
                if (center >= rect.top) {
                    const [from, to] = ZONES[i].range;
                    return { depth: Math.round(from + clamp((center - rect.top) / rect.height, 0, 1) * (to - from)), zone: ZONES[i].name };
                }
            }
            return { depth: 0, zone: 'Sea level' };
        };

        const frame = (now) => {
            // Refs detach before the cleanup cancels this loop on the way to an album page
            if (!karmaRef.current) return;
            const { depth: d, zone, land } = measureDepth();
            depth = d;
            diveState.current.depth = depth;
            const surfaceRect = surfaceRef.current.getBoundingClientRect();
            diveState.current.board = { x: surfaceRect.left + boardLocal.x, y: surfaceRect.top + boardLocal.y };
            // The fish moves, so read its mouth and lure from the markers riding on it
            const centre = (el) => {
                const r = el.getBoundingClientRect();
                return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
            };
            diveState.current.mouth = centre(fishSpotRefs.current.mouth);
            diveState.current.lure = centre(fishSpotRefs.current.lure);
            // Version 2: where the fish poops him out
            // diveState.current.vent = centre(fishSpotRefs.current.vent);
            const scroll = window.scrollY;
            const dy = scroll - lastScroll;
            lastScroll = scroll;

            if (`${depth}${zone}` !== shownDepth) {
                shownDepth = `${depth}${zone}`;
                depthRef.current.textContent = fmt(depth);
                zoneNameRef.current.textContent = zone;
                markerRef.current.style.transform = `translateY(${Math.sqrt(depth / MAX_DEPTH) * 100}%)`;
                hudRef.current.style.opacity = surfaceRect.bottom < h * 0.6 && !land ? 1 : 0;
            }

            // Marine snow thickens with depth and drifts against the scroll
            ctx.clearRect(0, 0, w, h);
            const snowAlpha = depth > 0 ? 0.08 + clamp(depth / 3000, 0, 1) * 0.5 : 0;
            if (snowAlpha > 0) {
                ctx.fillStyle = 'rgb(215,232,238)';
                ctx.globalAlpha = snowAlpha;
                for (const s of snow) {
                    s.y -= dy * s.z * 0.4 - 0.2 * s.z;
                    s.x += Math.sin(now * 0.0006 + s.drift) * 0.15;
                    if (s.y < 0) s.y += h;
                    if (s.y > h) s.y -= h;
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, s.r * s.z, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = 1;
            }

            // Thom's breath, anchored to the water so it slides away as you scroll
            const { bubbles, thom } = diveState.current;
            ctx.strokeStyle = 'rgba(200,235,255,0.7)';
            ctx.lineWidth = 1;
            for (let i = bubbles.length - 1; i >= 0; i--) {
                const b = bubbles[i];
                b.y -= b.vy + dy;
                b.x += Math.sin(now * 0.004 + b.phase) * 0.4;
                b.life -= 0.006;
                if (b.life <= 0 || b.y < -20 || b.y > h + 20) {
                    bubbles.splice(i, 1);
                    continue;
                }
                ctx.globalAlpha = b.life;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;

            // Past the twilight Thom's lamp is the only light; young Thom's headlamp
            // throws it further and warmer in the trench
            const torch = diveState.current.eaten ? 0 : clamp((depth - 600) / 1200, 0, 1);
            const lamp = diveState.current.gear >= GEAR_LEVEL.light;
            torchRef.current.style.opacity = torch;
            torchRef.current.style.background = lamp
                ? `radial-gradient(420px circle at ${thom.x}px ${thom.y}px, rgba(255,236,190,0.22), transparent 70%)`
                : `radial-gradient(280px circle at ${thom.x}px ${thom.y}px, rgba(120,180,220,0.16), transparent 70%)`;

            raf = requestAnimationFrame(frame);
        };

        resize();
        raf = requestAnimationFrame(frame);
        window.addEventListener('resize', resize);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
        };
    }, []);

    // Thom's route: off the diving board, past each band member's gift and through every
    // record, down to the Karma Fish. Rebuilt whenever the page changes size
    useEffect(() => {
        const root = rootRef.current;
        const dive = diveState.current;
        let raf = 0;

        const build = () => {
            const width = root.clientWidth;
            const height = root.offsetHeight;
            const surface = surfaceRef.current;
            const feet = coverPoint(SURFACE_IMAGE, surface.clientWidth, surface.clientHeight, BOARD_FEET.x, BOARD_FEET.y);
            const stops = [{ x: surface.offsetLeft + feet.x, y: surface.offsetTop + feet.y - 60 }];
            for (const zone of ZONES) {
                const gear = gearRefs.current[zone.id];
                if (gear) stops.push(localCentre(gear, root));
                for (const album of zone.albums) {
                    const cover = root.querySelector(`[data-album="${album.id}"]`);
                    if (cover) stops.push(localCentre(cover, root));
                }
            }
            // Into the fish
            const karma = karmaRef.current;
            stops.push({ x: width / 2, y: karma.offsetTop + window.innerHeight * 0.4 });
            // Version 2: then out onto the highway
            // const highway = highwayRef.current;
            // stops.push({ x: width * 0.42, y: highway.offsetTop + highway.offsetHeight * 0.45 });
            // Always heading down, so scroll position maps onto the route one way only
            const ordered = stops.filter((p, i) => i === 0 || p.y > stops[i - 1].y + 40);

            // Smooth curve through every point (Catmull-Rom as cubic Béziers), measuring as we go
            const { points, stopAt } = weave(ordered, width);
            const measure = measureRef.current;
            const lens = [0];
            let d = `M${round(points[0].x)} ${round(points[0].y)}`;
            for (let i = 0; i < points.length - 1; i++) {
                const p0 = points[i - 1] || points[i];
                const p1 = points[i];
                const p2 = points[i + 1];
                const p3 = points[i + 2] || p2;
                const seg = `C${round(p1.x + (p2.x - p0.x) / 6)} ${round(p1.y + (p2.y - p0.y) / 6)} ${round(p2.x - (p3.x - p1.x) / 6)} ${round(p2.y - (p3.y - p1.y) / 6)} ${round(p2.x)} ${round(p2.y)}`;
                d += seg;
                measure.setAttribute('d', `M${round(p1.x)} ${round(p1.y)}${seg}`);
                lens.push(lens[i] + measure.getTotalLength());
            }
            const total = lens[lens.length - 1];

            const svg = routeSvgRef.current;
            svg.setAttribute('width', width);
            svg.setAttribute('height', height);
            svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
            const lines = [trailRef.current, trailGlowRef.current];
            for (const path of [routeRef.current, ...lines]) path.setAttribute('d', d);
            for (const line of lines) line.style.strokeDasharray = `${total} ${total}`;
            dive.route = {
                root,
                trail: trailRef.current,
                lines,
                total,
                stops: stopAt.map((k) => ({ y: points[k].y, len: lens[k] })),
            };
        };

        const schedule = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(build);
        };
        build();
        // Late images change the page height, and with it where everything sits
        const observer = new ResizeObserver(schedule);
        observer.observe(root);
        return () => {
            cancelAnimationFrame(raf);
            observer.disconnect();
            dive.route = null;
        };
    }, []);

    return (
        <div ref={rootRef} className="relative w-full text-white">
            <ThomDiver stateRef={diveState} />
            {/* Thom's route: faint dots ahead of him, a bright trail where he's been. Above the
                water colours, below the words */}
            <svg ref={routeSvgRef} className="absolute top-0 left-0 z-[1] pointer-events-none overflow-visible" fill="none" aria-hidden="true">
                <path ref={measureRef} visibility="hidden" />
                <path ref={routeRef} className="dive-route" strokeWidth="2" strokeLinecap="round" />
                <path ref={trailGlowRef} className="dive-trail-glow" strokeWidth="14" strokeLinecap="round" strokeDashoffset="100000" />
                <path ref={trailRef} className="dive-trail" strokeWidth="3" strokeLinecap="round" strokeDashoffset="100000" />
            </svg>
            <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-[5] pointer-events-none" />
            <div ref={torchRef} className="fixed inset-0 z-[6] pointer-events-none opacity-0" />

            {/* Depth gauge */}
            <div ref={hudRef} className="fixed left-4 md:left-10 bottom-6 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-50 flex gap-4 pointer-events-none opacity-0 transition-opacity duration-700">
                <div className="relative w-px h-24 md:h-[40vh] bg-white/20">
                    <div ref={markerRef} className="absolute -left-[3px] top-0 h-full w-[7px]">
                        <div className="w-[7px] h-[7px] rounded-full bg-[#9fe6ff] shadow-[0_0_12px_#9fe6ff]" />
                    </div>
                </div>
                <div className="flex flex-col justify-center font-mono text-white/75">
                    <span className="text-[10px] tracking-[0.3em] uppercase opacity-60">Depth</span>
                    <span className="text-lg md:text-2xl tabular-nums"><span ref={depthRef}>0</span> m</span>
                    <span ref={zoneNameRef} className="text-[10px] tracking-[0.3em] uppercase text-[#9fe6ff]/80 mt-1">Sea level</span>
                </div>
            </div>

            {/* Surface */}
            <section
                id="surface"
                ref={surfaceRef}
                className="relative h-screen overflow-hidden bg-[#3a8fa3]"
            >
                <img
                    src="/surface.webp"
                    alt="The Thames at Westminster, with a diving board on the embankment"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ objectPosition: `${SURFACE_IMAGE.posX * 100}% ${SURFACE_IMAGE.posY * 100}%` }}
                    draggable="false"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[#3a8fa3] pointer-events-none" />
                <div className="absolute inset-x-0 top-[13%] text-center px-6 z-10">
                    <p className="font-mono text-[10px] md:text-xs tracking-[0.4em] uppercase text-[#1c2a2e]/70">From light to dark</p>
                    <h1 className="title-serif text-6xl md:text-[9rem] leading-none text-[#1c2a2e] mt-4">Radiohead</h1>
                    <p className="title-serif italic text-lg md:text-2xl text-[#1c2a2e]/80 mt-4">A descent through nine records</p>
                </div>
                <div ref={seaLevelRef} className="absolute inset-x-0 -translate-y-1/2 flex items-center gap-4 px-6 md:px-12 font-mono text-[10px] tracking-[0.3em] uppercase text-white/80">
                    <span>Sea level · 0 m</span>
                    <span className="flex-1 border-t border-dashed border-white/50" />
                </div>
                <p className="absolute bottom-10 inset-x-0 text-center font-mono text-[10px] tracking-[0.4em] uppercase text-white/80 animate-pulse">Scroll to dive ↓</p>
            </section>

            {ZONES.map((zone, zi) => (
                <section
                    key={zone.id}
                    id={zone.id}
                    ref={(el) => (zoneRefs.current[zi] = el)}
                    className="relative px-6 md:px-24 pt-20 md:pt-28 pb-12 overflow-hidden"
                    style={{ background: `linear-gradient(${zone.colors[0]}, ${zone.colors[1]})` }}
                >
                    {zi === 0 && (
                        <div className="absolute inset-x-0 top-0 h-[120vh] pointer-events-none mix-blend-screen" aria-hidden="true">
                            {[8, 26, 47, 63, 82].map((left, i) => (
                                <div
                                    key={left}
                                    className="light-ray absolute top-0 h-full w-24 md:w-40 origin-top"
                                    style={{
                                        left: `${left}%`,
                                        animationDelay: `${i * -1.7}s`,
                                        background: 'linear-gradient(rgba(220,245,255,0.18), rgba(220,245,255,0))',
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    <div className="relative z-10 max-w-6xl mx-auto">
                        <div className="flex items-end gap-4 md:gap-6">
                            <div>
                                <h2 className="title-serif text-2xl md:text-4xl text-white">{zone.name}</h2>
                                <p className="font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/50 mt-1">
                                    {fmt(zone.range[0])} – {fmt(zone.range[1])} metres deep
                                </p>
                            </div>
                            <span className="flex-1 border-t border-dashed border-white/30 mb-2" />
                        </div>

                        <Encounter member={MEMBERS[zone.id]} zone={zone} gearRef={(el) => (gearRefs.current[zone.id] = el)} />

                        <div className="reveal max-w-2xl mt-16 md:mt-24">
                            <p className="font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/50">{zone.era}</p>
                            <h3 className="title-serif text-4xl md:text-6xl text-white mt-3">{zone.title}</h3>
                            <p className="font-sans text-base md:text-lg leading-relaxed text-white/75 mt-6">{zone.text}</p>
                        </div>

                        <div className="mt-8 md:mt-16">
                            {zone.albums.map((album, ai) => (
                                <AlbumSpecimen
                                    key={album.id}
                                    album={album}
                                    zone={zone}
                                    index={ai + zi}
                                    stateRef={diveState}
                                    startOpen={Boolean(returning) && album.id <= returning.albumId}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            ))}

            <div className="bg-black px-6 md:px-24 pt-8 pb-16 relative z-10">
                <div className="max-w-6xl mx-auto flex items-center gap-4 font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/50">
                    <span>Challenger Deep · {fmt(MAX_DEPTH)} m</span>
                    <span className="flex-1 border-t border-dashed border-white/20" />
                </div>
                <p className="max-w-6xl mx-auto mt-4 font-mono text-[10px] tracking-[0.2em] text-white/25">
                    Band caricatures © 2011 Stephen Lorenzo Walkes ·{' '}
                    <a href="http://artbysteviewalkes.blogspot.com" target="_blank" rel="noreferrer" className="underline hover:text-white/60">artbysteviewalkes.blogspot.com</a>
                </p>
            </div>

            {/* Karma Fish Zone: the end of the dive, and nearly of Thom. The scene stays pinned
                while the fish swallows him and, a screen later, passes him */}
            {/* Version 2: make this h-[220vh] again so the scene stays pinned for the poop */}
            <section id="karma" ref={karmaRef} className="relative h-screen bg-black">
                <div ref={karmaSceneRef} className="sticky top-0 h-screen overflow-hidden">
                    {/* The fish: placement → patrol (x) → swim bob → flip (facing) */}
                    <div className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2 w-[clamp(280px,44vw,600px)] pointer-events-none">
                        <div ref={fishRef}>
                            <div className="fish-swim">
                                <div ref={fishFlipRef}>
                                    <KarmaFish
                                        mouthRef={(el) => (fishSpotRefs.current.mouth = el)}
                                        lureRef={(el) => (fishSpotRefs.current.lure = el)}
                                        flashRef={(el) => (fishSpotRefs.current.flash = el)}
                                        ventRef={(el) => (fishSpotRefs.current.vent = el)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* A quiet sea floor and a small sign */}
                    <svg className="absolute inset-x-0 bottom-0 w-full h-[16vh]" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
                        <path d="M0 40 C 120 20, 220 46, 340 34 C 470 22, 560 48, 690 36 C 800 26, 900 44, 1000 30 V 100 H 0 Z" fill="#060a10" />
                    </svg>
                    <div className="absolute bottom-[11vh] right-[12%] flex flex-col items-center pointer-events-none">
                        <span className="border border-white/20 px-3 py-1.5 font-mono text-[10px] tracking-[0.3em] uppercase text-white/50">Karma Fish Zone</span>
                        <span className="w-px h-8 bg-white/20" />
                    </div>

                    <p
                        ref={verdictRef}
                        className="absolute inset-x-0 top-[18%] px-6 text-center title-serif italic text-4xl md:text-6xl text-white opacity-0 translate-y-5"
                    >
                        This is what you get.
                    </p>
                </div>
            </section>

            {/* Version 2: the Connecticut highway the Karma Fish poops Thom out onto
            // Out of the fish and up onto dry land: the Hartford interchange, the highway
                behind OK Computer. Version 2 picks up from here
            <section id="highway" ref={highwayRef} className="relative h-screen min-h-[640px] overflow-hidden bg-[#8fa9bf]">
                <img
                    src="/interchange.webp"
                    alt="Highway interchange beside the Connecticut River in Hartford"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    draggable="false"
                />
                // Surfacing from black into daylight
                <div className="absolute inset-x-0 top-0 h-[35%] bg-gradient-to-b from-black via-black/60 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/75 to-transparent pointer-events-none" />

                <div className="reveal absolute inset-x-0 top-[9%] px-6 text-center z-10">
                    <p className="font-mono text-[10px] md:text-xs tracking-[0.4em] uppercase text-white/75">Hartford, Connecticut · 0 m</p>
                    <h2 className="title-serif italic text-4xl md:text-7xl text-white mt-3 leading-tight [text-shadow:0_4px_24px_rgba(0,0,0,0.55)]">
                        I hit the bottom and escape.
                    </h2>
                </div>

                <div className="reveal absolute inset-x-0 bottom-[8%] px-6 z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 max-w-6xl mx-auto">
                    <p className="max-w-md text-center md:text-left font-sans text-sm md:text-base leading-relaxed text-white/85 [text-shadow:0_2px_10px_rgba(0,0,0,0.6)]">
                        Out of the fish, bare as when he jumped, Thom washes up beside the interchange whose blurred
                        photograph ended up on the cover of OK Computer. Cars, motorways, modern life: the next dive starts on the road.
                    </p>
                    <div className="road-sign shrink-0 px-5 py-3 text-center">
                        <p className="font-sans font-bold text-[10px] tracking-[0.25em] uppercase opacity-80">Exit 2</p>
                        <p className="font-sans font-bold text-xl md:text-2xl leading-tight">Version 2</p>
                        <p className="font-sans text-xs md:text-sm opacity-90">Coming soon ↑</p>
                    </div>
                </div>
            </section>
            */}
        </div>
    );
}
