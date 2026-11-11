import React, { useEffect, useRef, useState } from 'react';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// One picture per outfit level: nothing, then Jonny's scuba gear, Colin's goggles,
// Ed's hood, Phil's regulator and young Thom's headlamp
const OUTFITS = [
    '/divers/thom.webp',
    '/divers/thom-scuba.webp',
    '/divers/thom-goggles.webp',
    '/divers/thom-cap.webp',
    '/divers/thom-regulator.webp',
    '/divers/thom-light.webp',
];

// How far along the route Thom should be once `y` (route-local) reaches the middle
// of the screen: each stop is passed exactly as it scrolls through the centre
function lengthAt(route, y) {
    const { stops, total } = route;
    if (y <= stops[0].y) return 0;
    for (let i = 0; i < stops.length - 1; i++) {
        const a = stops[i];
        const b = stops[i + 1];
        if (y < b.y) return a.len + ((y - a.y) / (b.y - a.y)) * (b.len - a.len);
    }
    return total;
}

// Shortest way round from one angle to another, in degrees
const turn = (from, to) => ((((to - from) % 360) + 540) % 360) - 180;

// Thom waits on the diving board until the page scrolls, then swims the route that
// OceanDescent draws past every band member and record, drawing his trail behind him.
// While he swims he's a silhouette heading along the line (we only see his back);
// when the scroll stops he rights himself and faces us. In the Karma Fish Zone the
// anglerfish lures him off the route and swallows him. (Version 2, commented out for
// now: further down it poops him out, bare as he started, onto the Connecticut highway.)
export default function ThomDiver({ stateRef }) {
    const wrapRef = useRef(null);
    const bodyRef = useRef(null);
    // Version 2: the poop casing and its string
    // const poopRef = useRef(null);
    // const strandRefs = useRef([]);
    const outfitRefs = useRef([]);
    const tipRef = useRef(null);
    const hovered = useRef(false);
    const [standing, setStanding] = useState(true);

    useEffect(() => {
        const pos = { x: -999, y: -999 };
        let placed = false;
        let wasStanding = true;
        let len = -1;
        let catchUp = 1;
        let rot = 0;
        let sil = 0;
        let gear = 0;
        let tip = 0;
        let hopY = 0;
        let hopV = 0;
        let prev = { x: 0, y: 0 };
        let raf = 0;
        // 0 free, 1 drawn to the lure, 2 pulled into the mouth, 3 swallowed, 4 coming out the back
        let eatPhase = 0;
        let eatStart = 0;
        let eatScale = 1;
        // Version 2: whether he's been pooped out, and how much of the casing still shows
        // let outBack = false;
        // let poo = 0;

        const burst = (s, x, y, n) => {
            for (let i = 0; i < n; i++) {
                s.bubbles.push({ x: x + (Math.random() - 0.5) * 50, y: y + (Math.random() - 0.5) * 50, r: 2 + Math.random() * 5, vy: 0.8 + Math.random() * 1.6, phase: Math.random() * 6.28, life: 1 });
            }
        };

        const frame = (now) => {
            // Refs detach before the cleanup cancels this loop on the way to an album page
            if (!bodyRef.current) return;
            const s = stateRef.current;
            const { route } = s;
            const onBoard = window.scrollY < 4 && s.board;
            const body = bodyRef.current;
            if (!route || !s.board) {
                raf = requestAnimationFrame(frame);
                return;
            }

            // Follow the route, easing along it so a flick of the wheel becomes a swim
            const rr = route.root.getBoundingClientRect();
            const want = onBoard ? 0 : lengthAt(route, window.innerHeight / 2 - rr.top);
            if (len < 0) len = want;
            // The trail stops drawing while he's inside the fish
            if (!eatPhase) len += (want - len) * 0.12;
            const lead = want - len;
            const here = route.trail.getPointAtLength(len);
            const behind = route.trail.getPointAtLength(Math.max(0, len - 4));
            const ahead = route.trail.getPointAtLength(Math.min(route.total, len + 4));
            const heading = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI;
            for (const line of route.lines) line.style.strokeDashoffset = route.total - len;

            let tx = rr.left + here.x;
            let ty = rr.top + here.y;
            if (onBoard) {
                // Feet on the end of the board
                tx = s.board.x;
                ty = s.board.y - body.offsetHeight / 2;
            }
            if (!placed) {
                pos.x = tx;
                pos.y = ty;
                placed = true;
            }
            if (onBoard !== wasStanding) {
                wasStanding = onBoard;
                setStanding(Boolean(onBoard));
                catchUp = 0.1;
                if (!onBoard) {
                    hopV = -9; // spring off the board
                    hovered.current = false;
                }
            }

            /* Version 2: out the back of the fish. Restoring this also means wrapping the
               eaten checks below in `else if (!outBack) { … }`
            if (s.pooped && !outBack) {
                // Out the back of the fish, stripped of all his gear
                outBack = true;
                eatPhase = 4;
                eatStart = now;
                eatScale = 0;
                poo = 1;
                gear = s.gear;
                if (s.vent) {
                    pos.x = s.vent.x;
                    pos.y = s.vent.y;
                }
            } else if (!s.pooped && outBack) {
                // Scrolled back up: sucked back inside
                outBack = false;
                eatPhase = s.eaten ? 3 : 0;
            }
            */
            if (s.eaten && eatPhase === 0 && s.lure) {
                eatPhase = 1;
                eatStart = now;
            } else if (!s.eaten && eatPhase) {
                if (eatPhase === 3 && s.mouth) burst(s, s.mouth.x, s.mouth.y, 20); // spat back out
                eatPhase = 0;
                catchUp = 0.05;
            }
            catchUp = Math.min(1, catchUp + 0.02);
            let follow = catchUp;
            let targetScale = 1;
            /* Version 2: phase 4, put back in front of `if (eatPhase)` as `if (eatPhase === 4) { … } else`
                // Squeezed out the back, trailing away from the fish and sinking on its string,
                // until the casing tears and he swims free
                const t = now - eatStart;
                const bx = s.vent.x - s.mouth.x;
                const by = s.vent.y - s.mouth.y;
                const bl = Math.hypot(bx, by) || 1;
                const d = (1 - (1 - clamp(t / 1600, 0, 1)) ** 2) * 170;
                tx = s.vent.x + (bx / bl) * d * 0.7;
                ty = s.vent.y + (by / bl) * d * 0.7 + d * 0.6;
                follow = 0.5;
                targetScale = clamp(t / 500, 0, 1);
                if (t > 2000) {
                    eatPhase = 0;
                    catchUp = 0.04;
                    burst(s, pos.x, pos.y, 30);
                }
            */
            if (eatPhase) {
                const spot = eatPhase === 1 ? s.lure : s.mouth;
                tx = spot.x;
                ty = spot.y;
                const dist = Math.hypot(tx - pos.x, ty - pos.y);
                if (eatPhase === 1) {
                    follow = 0.05;
                    if (dist < 40 || now - eatStart > 1600) eatPhase = 2;
                } else if (eatPhase === 2) {
                    follow = 0.16;
                    targetScale = clamp(dist / 160, 0.2, 1);
                    if (dist < 14) {
                        eatPhase = 3;
                        burst(s, tx, ty, 24);
                        s.onSwallow?.();
                    }
                } else {
                    targetScale = 0;
                }
            }
            eatScale += (targetScale - eatScale) * 0.2;
            // Version 2: poo += ((eatPhase === 4 ? 1 : 0) - poo) * 0.25;

            pos.x += (tx - pos.x) * follow;
            pos.y += (ty - pos.y) * follow;
            hopY += hopV;
            hopV += 0.7;
            if (hopY >= 0) {
                hopY = 0;
                hopV = 0;
            }
            const vx = pos.x - prev.x;
            const vy = pos.y - prev.y;
            prev = { x: pos.x, y: pos.y };

            // Head first along the line, whichever way he's going; upright at rest.
            // Off the route (being eaten) he faces where he's actually moving
            let moving = !onBoard && Math.abs(lead) > 2;
            let targetRot = 0;
            if (eatPhase) {
                moving = Math.hypot(vx, vy) > 1;
                if (moving) targetRot = (Math.atan2(vy, vx) * 180) / Math.PI + 90;
            } else if (moving) {
                targetRot = heading + (lead > 0 ? 90 : -90);
            }
            rot += turn(rot, targetRot) * 0.12;
            const hidden = !onBoard && (moving || Math.abs(turn(0, rot)) > 30);
            sil += ((hidden ? 1 : 0) - sil) * 0.12;
            gear += (s.gear - gear) * 0.1;
            tip += ((onBoard && hovered.current ? 1 : 0) - tip) * 0.15;

            s.thom.x = pos.x;
            s.thom.y = pos.y + hopY;

            wrapRef.current.style.transform = `translate3d(${pos.x}px,${pos.y + hopY}px,0)`;
            body.style.transform = `translate(-50%,-50%) rotate(${rot}deg) scale(${eatScale})`;
            /* Version 2: the poop casing and its string
            body.style.opacity = 1 - poo * 0.85;
            // The casing lies along its string, then swells and dissolves as he tears out of it
            const strand = strandRefs.current;
            if (poo > 0.01 && s.vent) {
                const ang = Math.atan2(pos.y - s.vent.y, pos.x - s.vent.x);
                const half = (poopRef.current.offsetWidth / 2) * eatScale * 0.9;
                const rx = pos.x - Math.cos(ang) * half;
                const ry = pos.y - Math.sin(ang) * half;
                // A limp, wavering string between the vent and the casing's tail
                const nx = -Math.sin(ang);
                const ny = Math.cos(ang);
                const w1 = Math.sin(now * 0.004) * 14 + 10;
                const w2 = Math.sin(now * 0.004 + 2.2) * 14;
                const c1x = s.vent.x + (rx - s.vent.x) / 3 + nx * w1;
                const c1y = s.vent.y + (ry - s.vent.y) / 3 + ny * w1 + 12;
                const c2x = s.vent.x + ((rx - s.vent.x) * 2) / 3 + nx * w2;
                const c2y = s.vent.y + ((ry - s.vent.y) * 2) / 3 + ny * w2 + 8;
                const d = `M${s.vent.x} ${s.vent.y}C${c1x} ${c1y} ${c2x} ${c2y} ${rx} ${ry}`;
                for (const path of strand) path.setAttribute('d', d);
                strand[0].parentNode.style.opacity = poo;
                poopRef.current.style.transform = `translate(-50%,-50%) rotate(${ang}rad) scale(${eatScale * (1.5 - 0.5 * poo)})`;
            } else {
                strand[0].parentNode.style.opacity = 0;
            }
            poopRef.current.style.opacity = poo;
            */
            body.style.filter = sil > 0.01
                ? `brightness(${1 - sil}) drop-shadow(0 0 ${4 + 6 * sil}px rgba(159,230,255,${0.55 * sil}))`
                : 'none';
            outfitRefs.current.forEach((img, i) => {
                img.style.opacity = clamp(1 - Math.abs(gear - i), 0, 1);
            });

            // Beside him where there's room, otherwise above or below; always fully on screen
            const tipEl = tipRef.current;
            tipEl.style.opacity = tip;
            if (tip > 0.01) {
                const vw = window.innerWidth;
                const vh = window.innerHeight;
                const tw = tipEl.offsetWidth;
                const th = tipEl.offsetHeight;
                const cy = pos.y + hopY;
                const halfW = body.offsetWidth / 2;
                const halfH = body.offsetHeight / 2;
                const gap = 12;
                const edge = 12;
                let x;
                let y = cy - th / 2;
                if (pos.x + halfW + gap + tw <= vw - edge) {
                    x = pos.x + halfW + gap;
                } else if (pos.x - halfW - gap - tw >= edge) {
                    x = pos.x - halfW - gap - tw;
                } else {
                    x = pos.x - tw / 2;
                    y = cy - halfH - gap - th >= edge ? cy - halfH - gap - th : cy + halfH + gap;
                }
                x = clamp(x, edge, vw - edge - tw);
                y = clamp(y, edge, vh - edge - th);
                tipEl.style.transform = `translate(${x - pos.x}px, ${y - cy}px) scale(${0.9 + tip * 0.1})`;
            }

            if (s.depth > 0 && eatPhase < 3) {
                const rate = moving ? 0.35 : gear > 0.5 ? 0.025 : 0;
                if (Math.random() < rate) {
                    s.bubbles.push({ x: pos.x + (Math.random() - 0.5) * 30, y: pos.y + (Math.random() - 0.5) * 30, r: 2 + Math.random() * 4, vy: 0.8 + Math.random() * 1.2, phase: Math.random() * 6.28, life: 1 });
                }
            }

            raf = requestAnimationFrame(frame);
        };

        raf = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(raf);
    }, [stateRef]);

    return (
        <>
            {/* Version 2: the faeces string hanging from the vent
            // The string of faeces still hanging from the fish's vent
            <svg className="fixed inset-0 w-full h-full z-[189] pointer-events-none opacity-0" fill="none" aria-hidden="true">
                <path ref={(el) => (strandRefs.current[0] = el)} stroke="#3a2a17" strokeOpacity="0.95" strokeWidth="5" strokeLinecap="round" />
                <path ref={(el) => (strandRefs.current[1] = el)} stroke="#8a7048" strokeOpacity="0.55" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="10 6 3 8" />
            </svg>
            */}
            <div ref={wrapRef} className="fixed top-0 left-0 z-[190] pointer-events-none">
                <div
                    ref={bodyRef}
                    className={`absolute top-0 left-0 w-20 md:w-28 will-change-transform ${standing ? 'pointer-events-auto' : ''}`}
                    onPointerEnter={() => { hovered.current = true; }}
                    onPointerLeave={() => { hovered.current = false; }}
                    onClick={() => { hovered.current = !hovered.current; }}
                    aria-label="Thom Yorke"
                >
                    {OUTFITS.map((src, i) => (
                        <img
                            key={src}
                            ref={(el) => (outfitRefs.current[i] = el)}
                            src={src}
                            alt=""
                            className={`w-full ${i ? 'absolute top-0 left-0 opacity-0' : ''}`}
                            draggable="false"
                        />
                    ))}
                </div>

                {/* Version 2: the poop casing Thom comes out in
                // Fish faeces: a lumpy, mucus-slick casing, segmented where the gut squeezed it,
                    flecked with undigested bits. Drawn lengthways, tail end (left) towards the vent
                <div ref={poopRef} className="absolute top-0 left-0 w-36 md:w-44 opacity-0 will-change-transform" aria-hidden="true">
                    <svg viewBox="0 0 160 64" className="feces-squirm w-full drop-shadow-[0_6px_12px_rgba(0,0,0,0.55)]">
                        <defs>
                            <linearGradient id="feces-fill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stopColor="#6e5636" />
                                <stop offset="0.45" stopColor="#4b3820" />
                                <stop offset="1" stopColor="#2a1f12" />
                            </linearGradient>
                            <radialGradient id="feces-gloss" cx="0.45" cy="0.25" r="0.6">
                                <stop offset="0" stopColor="#d9cba4" stopOpacity="0.35" />
                                <stop offset="1" stopColor="#d9cba4" stopOpacity="0" />
                            </radialGradient>
                        </defs>
                        <path id="feces-shape" d="M4 34 C 2 30, 10 27, 22 26 C 32 17, 50 14, 63 18 C 76 10, 96 10, 108 15 C 123 11, 143 15, 151 25 C 159 33, 157 45, 147 49 C 135 56, 117 54, 105 50 C 93 58, 73 58, 61 52 C 47 56, 31 50, 23 43 C 12 42, 5 39, 4 34 Z" fill="url(#feces-fill)" opacity="0.94" />
                        // Slime film
                        <use href="#feces-shape" fill="none" stroke="#b9a678" strokeOpacity="0.28" strokeWidth="4" />
                        <use href="#feces-shape" fill="url(#feces-gloss)" />
                        // Constrictions between segments
                        <path d="M24 27 C 27 33, 27 39, 24 43 M63 18 C 67 28, 67 42, 61 52 M107 15 C 111 26, 111 40, 105 50" stroke="#21180d" strokeOpacity="0.6" strokeWidth="1.6" fill="none" />
                        // Undigested flecks: grit, plant matter, scraps of shell
                        <ellipse cx="40" cy="30" rx="3" ry="1.6" fill="#8d7a52" opacity="0.8" />
                        <ellipse cx="82" cy="24" rx="2.4" ry="1.4" fill="#6f7444" opacity="0.85" />
                        <ellipse cx="128" cy="30" rx="3.2" ry="1.5" fill="#8d7a52" opacity="0.7" />
                        <ellipse cx="92" cy="42" rx="2" ry="1.2" fill="#d8d0b8" opacity="0.6" />
                        <ellipse cx="48" cy="44" rx="1.8" ry="1" fill="#6f7444" opacity="0.8" />
                        <ellipse cx="140" cy="40" rx="1.6" ry="1" fill="#d8d0b8" opacity="0.5" />
                        <circle cx="72" cy="36" r="1" fill="#a99467" />
                        <circle cx="118" cy="22" r="0.9" fill="#a99467" />
                        // Wet highlights
                        <path d="M30 24 C 40 19, 52 18, 60 20 M72 15 C 84 12, 96 12, 104 16 M114 15 C 128 14, 140 18, 146 24" stroke="#efe4c4" strokeOpacity="0.4" strokeWidth="1.4" strokeLinecap="round" fill="none" />
                    </svg>
                </div>
                */}

                <div ref={tipRef} className="water-tip absolute top-0 left-0 w-56 md:w-64 max-w-[calc(100vw-24px)] p-5 opacity-0 origin-center" aria-hidden={!standing}>
                    <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#bfefff]/70">That's you</p>
                    <p className="title-serif text-2xl text-white mt-1">Thom Yorke</p>
                    <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/60 mt-1">Vocals · guitar · piano · b. 1968</p>
                    <p className="font-sans text-sm text-white/80 mt-3 leading-snug">
                        Voice and principal songwriter. Also The Smile, Atoms for Peace and solo records like The Eraser. Scroll to jump in.
                    </p>
                </div>
            </div>
        </>
    );
}
