import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { rememberDive } from '../data/descent';

gsap.registerPlugin(useGSAP);

// How close Thom has to swim to a find, beyond its edges, before he opens it
const REACH = 110;

// Softens the flat waterline where each find was cut out of the sea
const WATERLINE = 'linear-gradient(black 78%, transparent)';

const pct = (points) => points.map(([x, y]) => `${x}% ${y}%`).join(',');

// The picture cut into the parts that move on their own, as clip-path polygons
function piecesOf(find) {
    const { kind, seam, bands } = find;
    if (kind === 'lid' || kind === 'hinge') {
        // Body below the seam, lid above it
        return [[[0, 100], ...seam, [100, 100]], [[0, 0], [100, 0], ...[...seam].reverse()]];
    }
    if (kind === 'split') {
        // Seam runs top to bottom: left half, right half
        return [[[0, 0], ...seam, [0, 100]], [[100, 0], ...seam, [100, 100]]];
    }
    if (kind === 'peel') {
        // Horizontal strips, top first
        const edges = [0, ...bands, 100];
        return edges.slice(1).map((y, i) => [[0, edges[i]], [100, edges[i]], [100, y], [0, y]]);
    }
    return [null];
}

const seamMid = (seam) => seam.reduce((sum, [, y]) => sum + y, 0) / seam.length;

// What each find does as it gives up its record, before the cover floats free.
// Loops get their own tweens, so the timeline keeps an end to jump to.
const OPENINGS = {
    // The petals open out and the flower turns slowly on the water
    bloom: (tl, el) => {
        tl.to(el.body, { scale: 1.1, rotation: 14, duration: 1.4, ease: 'power2.out' }, 0)
            .call(() => gsap.to(el.body, { rotation: '+=360', duration: 90, ease: 'none', repeat: -1 }), null, 1.4);
    },
    // The head tips back, letting go of what it held to its chest
    tilt: (tl, el) => {
        tl.to(el.body, { rotation: -8, yPercent: -6, xPercent: -6, duration: 1.3, ease: 'power2.out', transformOrigin: '30% 60%' }, 0);
    },
    // Static, a flash, and the picture pushes out of the glass
    screen: (tl, el) => {
        tl.fromTo(el.screen, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15, repeat: 3, yoyo: true }, 0)
            .to(el.screen, { autoAlpha: 1, duration: 0.1 })
            .fromTo(el.flash, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12, yoyo: true, repeat: 1 }, '<');
    },
    // Light runs down a fracture and the ice parts along it
    split: (tl, el) => {
        tl.fromTo(el.crack, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12, repeat: 3, yoyo: true }, 0)
            .to(el.crack, { autoAlpha: 1, duration: 0.2 })
            .to(el.pieces[0], { xPercent: -9, rotation: -5, duration: 1.4, ease: 'power2.out', transformOrigin: '20% 100%' }, 0.55)
            .to(el.pieces[1], { xPercent: 9, rotation: 5, duration: 1.4, ease: 'power2.out', transformOrigin: '80% 100%' }, 0.55)
            .to(el.crack, { autoAlpha: 0, duration: 0.8 }, 1.2);
    },
    // The lid lifts off its seam and drifts away
    lid: (tl, el) => {
        tl.to(el.pieces[1], { yPercent: -38, xPercent: -6, rotation: -9, duration: 1.1, ease: 'power2.out' }, 0)
            .call(() => gsap.to(el.pieces[1], { yPercent: -46, rotation: -12, duration: 3, ease: 'sine.inOut', repeat: -1, yoyo: true }), null, 1.1);
    },
    // The sign comes apart in layers that drift off different ways
    peel: (tl, el) => {
        tl.to(el.pieces, {
            xPercent: (i) => (i % 2 ? 16 : -16) * (1 + i * 0.25),
            yPercent: (i) => 6 + i * 8,
            rotation: (i) => (i % 2 ? 7 : -6),
            opacity: 0.45,
            duration: 1.3,
            ease: 'power2.out',
            stagger: 0.18,
        }, 0);
    },
    // The plastic ripples, its colours shift, and it thins enough to see through
    ripple: (tl, el) => {
        tl.to(el.body, { skewX: 6, scaleY: 0.9, duration: 0.4, ease: 'sine.inOut', repeat: 3, yoyo: true }, 0)
            .to(el.body, { filter: 'hue-rotate(120deg) saturate(1.5)', duration: 1.6 }, 0)
            .to(el.img, { opacity: 0.6, duration: 1 }, 0.3);
    },
    // The stump shudders and silt lifts off the roots
    roots: (tl, el) => {
        tl.fromTo(el.body, { x: -5 }, { x: 0, duration: 0.8, ease: 'elastic.out(1.4, 0.15)' }, 0)
            .fromTo(el.silt, { autoAlpha: 0.8, y: 0, scale: 0.6 }, { autoAlpha: 0, y: -40, scale: 1.6, duration: 1.4, ease: 'power1.out' }, 0);
    },
    // The lid swings up on its hinge and the ring catches the light
    hinge: (tl, el) => {
        tl.to(el.pieces[1], { scaleY: 1, filter: 'brightness(1)', duration: 1.2, ease: 'back.out(1.2)' }, 0)
            .fromTo(el.glint, { autoAlpha: 0, scale: 0.2, rotation: -30 }, { autoAlpha: 1, scale: 1, rotation: 15, duration: 0.5, ease: 'power2.out' }, 0.8)
            .to(el.glint, { autoAlpha: 0.5, scale: 0.7, duration: 0.6 }, '>');
    },
};

// Where the record starts from inside each find, and when it begins to rise
const RISE_AT = { screen: 0.75, split: 0.9, peel: 0.5, hinge: 0.9 };

// A piece of junk drifting at the album's depth. When Thom swims close (or
// passes it on the way down, or you tap it), it opens and the record floats out.
export default function FoundObject({ album, zone, stateRef, startOpen, onOpen }) {
    const { find } = album;
    const rootRef = useRef(null);
    const objRef = useRef(null);
    const coverRef = useRef(null);
    const hintRef = useRef(null);
    const parts = useRef({});
    const opened = useRef(false);
    const openRef = useRef(() => {});
    const glow = zone.glow || '255,240,200';
    const dim = find.dim ?? 1;
    const pieces = piecesOf(find);

    useGSAP((context, contextSafe) => {
        const el = parts.current;
        el.pieces = gsap.utils.toArray('[data-piece]', rootRef.current);

        openRef.current = contextSafe((instant = false) => {
            if (opened.current) return;
            opened.current = true;
            const obj = objRef.current.getBoundingClientRect();
            const cover = coverRef.current.getBoundingClientRect();
            const [mx, my] = find.mouth;
            const from = {
                x: obj.left + obj.width * mx - (cover.left + cover.width / 2),
                y: obj.top + obj.height * my - (cover.top + cover.height / 2),
            };
            const startScale = find.kind === 'screen' ? (obj.width * find.screen[2]) / 100 / cover.width : 0.12;

            const tl = gsap.timeline();
            tl.to(hintRef.current, { autoAlpha: 0, duration: 0.3 }, 0)
                .to(el.img, { filter: `brightness(${Math.min(1, dim + 0.35)})`, duration: 0.8 }, 0)
                .fromTo(el.burst, { autoAlpha: 0, scale: 0.3 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, 0.1);
            OPENINGS[find.kind](tl, el);
            const rise = RISE_AT[find.kind] ?? 0.45;
            tl.fromTo(coverRef.current,
                { autoAlpha: 0, x: from.x, y: from.y, scale: startScale, rotation: find.kind === 'screen' ? 0 : -14 },
                { autoAlpha: 1, x: 0, y: 0, scale: 1, rotation: 0, duration: 1.6, ease: 'power3.out' }, rise)
                .to(el.burst, { autoAlpha: 0.35, scale: 1.3, duration: 1.2 }, rise + 0.4);
            onOpen?.(tl, rise + 0.6);

            if (instant) {
                tl.progress(1);
                return;
            }
            // A rush of bubbles where it opened
            const s = stateRef.current;
            const bx = obj.left + obj.width * mx;
            const by = obj.top + obj.height * my;
            for (let i = 0; i < 26; i++) {
                s.bubbles.push({ x: bx + (Math.random() - 0.5) * obj.width * 0.6, y: by + (Math.random() - 0.5) * 30, r: 2 + Math.random() * 5, vy: 1 + Math.random() * 2, phase: Math.random() * 6.28, life: 1 });
            }
        });

        gsap.set(coverRef.current, { autoAlpha: 0 });
        // The ring box starts shut: its lid folded down over the cushion
        if (find.kind === 'hinge') {
            gsap.set(el.pieces[1], { scaleY: -0.6, transformOrigin: `50% ${seamMid(find.seam)}%`, filter: 'brightness(0.55)' });
        }
        if (startOpen) openRef.current(true);
    }, { scope: rootRef });

    // Open when Thom swims close, or once he has drifted past it on the way down
    useEffect(() => {
        if (startOpen) return undefined;
        let raf = 0;
        const check = () => {
            if (opened.current || !objRef.current) return;
            const { thom } = stateRef.current;
            const r = objRef.current.getBoundingClientRect();
            const dx = Math.max(r.left - thom.x, 0, thom.x - r.right);
            const dy = Math.max(r.top - thom.y, 0, thom.y - r.bottom);
            if (Math.hypot(dx, dy) < REACH || r.bottom < window.innerHeight * 0.35) openRef.current();
            else raf = requestAnimationFrame(check);
        };
        raf = requestAnimationFrame(check);
        return () => cancelAnimationFrame(raf);
    }, [stateRef, startOpen]);

    const set = (key) => (node) => { parts.current[key] = node; };
    const [mx, my] = find.mouth;
    const overlayBox = (rect) => ({ left: `${rect[0]}%`, top: `${rect[1]}%`, width: `${rect[2]}%`, height: `${rect[3]}%` });

    return (
        <div ref={rootRef} className="relative w-full max-w-[26rem] h-[27rem] md:h-[34rem] shrink-0">
            {/* The record, waiting inside until it's let out */}
            <Link
                ref={coverRef}
                to={`/album/${album.id}`}
                data-album={album.id}
                onClick={(e) => rememberDive(album.id, e.currentTarget)}
                className={`group absolute left-1/2 top-0 -ml-26 md:-ml-32 block w-52 md:w-64 ${find.front ? 'z-30' : 'z-10'}`}
            >
                <div
                    className={`aspect-square bg-cover bg-center rounded-sm ${zone.glow ? 'deep-cover' : ''}`}
                    style={{
                        backgroundImage: `url('${album.image}')`,
                        boxShadow: zone.glow ? `0 0 60px rgba(${glow},0.35), 0 0 0 1px rgba(${glow},0.4)` : '0 20px 50px rgba(0,30,40,0.35)',
                    }}
                />
                <span className="absolute -bottom-3 right-3 font-mono text-[10px] tracking-[0.3em] uppercase bg-black/60 backdrop-blur px-2 py-1 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                    Open file →
                </span>
            </Link>

            {/* The find itself, bobbing in the current */}
            <div className="absolute inset-x-0 bottom-6 flex justify-center z-20">
                <div className="member-bob">
                    <button
                        ref={objRef}
                        type="button"
                        onClick={() => openRef.current()}
                        aria-label={`Open the ${find.name.toLowerCase()}`}
                        className="relative block"
                        style={{ width: `min(${find.width}px, 70vw)` }}
                    >
                        <div
                            ref={set('burst')}
                            className="absolute w-[140%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none opacity-0"
                            style={{ left: `${mx * 100}%`, top: `${my * 100}%`, background: `radial-gradient(circle, rgba(${glow},0.45), transparent 60%)` }}
                        />

                        <div ref={set('body')} className="relative">
                            <div ref={set('img')} className="relative" style={{ filter: `brightness(${dim})` }}>
                                {pieces.map((poly, i) => (
                                    <img
                                        key={i}
                                        data-piece
                                        src={find.src}
                                        alt=""
                                        draggable="false"
                                        className={`w-full ${i ? 'absolute inset-0' : ''}`}
                                        style={{ clipPath: poly ? `polygon(${pct(poly)})` : undefined, maskImage: WATERLINE }}
                                    />
                                ))}
                            </div>

                            {find.kind === 'screen' && (
                                <>
                                    <span ref={set('screen')} className="crt-static absolute opacity-0 rounded-[10%]" style={overlayBox(find.screen)} />
                                    <span ref={set('flash')} className="absolute opacity-0 rounded-[10%] bg-white mix-blend-screen" style={overlayBox(find.screen)} />
                                </>
                            )}
                            {find.kind === 'split' && (
                                <svg ref={set('crack')} viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full opacity-0 overflow-visible" aria-hidden="true">
                                    <polyline
                                        points={find.seam.map(([x, y]) => `${x},${y}`).join(' ')}
                                        fill="none"
                                        stroke={`rgb(${glow})`}
                                        strokeWidth="2.5"
                                        vectorEffect="non-scaling-stroke"
                                        style={{ filter: `drop-shadow(0 0 6px rgb(${glow})) drop-shadow(0 0 14px rgb(${glow}))` }}
                                    />
                                </svg>
                            )}
                            {find.kind === 'roots' && (
                                <span
                                    ref={set('silt')}
                                    className="absolute inset-x-[10%] top-[30%] h-[50%] rounded-[50%] opacity-0 blur-md"
                                    style={{ background: 'radial-gradient(ellipse, rgba(190,170,130,0.55), transparent 70%)' }}
                                />
                            )}
                            {find.kind === 'hinge' && (
                                <span
                                    ref={set('glint')}
                                    className="absolute w-[40%] aspect-square -translate-x-1/2 -translate-y-1/2 opacity-0 mix-blend-screen"
                                    style={{
                                        left: `${find.glint[0]}%`, top: `${find.glint[1]}%`,
                                        background: 'radial-gradient(circle, #fff 0 4%, transparent 9%), linear-gradient(transparent 48%, rgba(255,255,255,0.8) 50%, transparent 52%), linear-gradient(90deg, transparent 48%, rgba(255,255,255,0.8) 50%, transparent 52%)',
                                        maskImage: 'radial-gradient(circle, black 20%, transparent 65%)',
                                    }}
                                />
                            )}
                        </div>
                    </button>
                </div>
            </div>

            <p ref={hintRef} className="absolute inset-x-0 bottom-0 text-center font-mono text-[10px] tracking-[0.3em] uppercase text-white/50">
                {find.name} · drifting
            </p>
        </div>
    );
}
