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

// Thom waits on the diving board until the page scrolls, then becomes the cursor.
// While scrolling he dives head-first as a silhouette (we only see his back);
// when it stops he rights himself and faces us. In the Karma Fish Zone the
// anglerfish lures him in and swallows him.
export default function ThomDiver({ stateRef }) {
    const wrapRef = useRef(null);
    const bodyRef = useRef(null);
    const outfitRefs = useRef([]);
    const tipRef = useRef(null);
    const dotRef = useRef(null);
    const hovered = useRef(false);
    const [standing, setStanding] = useState(true);

    useEffect(() => {
        // Follow whatever input is actually in use, so a phone (or a desktop
        // switched to a touch view) never leaves Thom chasing a stale mouse spot
        let usingMouse = window.matchMedia('(pointer: fine)').matches;
        const target = { x: 0, y: 0 };
        const restingSpot = () => {
            target.x = window.innerWidth - (usingMouse ? window.innerWidth * 0.2 : 64);
            target.y = window.innerHeight * (usingMouse ? 0.5 : 0.6);
        };
        restingSpot();
        const pos = { x: -999, y: -999 };
        let placed = false;
        let wasStanding = true;
        let lastScroll = window.scrollY;
        let vel = 0;
        let lastMove = -1e4;
        let rot = 0;
        let sil = 0;
        let gear = 0;
        let tip = 0;
        let hopY = 0;
        let hopV = 0;
        let prevX = 0;
        let raf = 0;
        // 0 free, 1 drawn to the lure, 2 pulled into the mouth, 3 swallowed
        let eatPhase = 0;
        let eatStart = 0;
        let eatScale = 1;

        const burst = (s, x, y, n) => {
            for (let i = 0; i < n; i++) {
                s.bubbles.push({ x: x + (Math.random() - 0.5) * 50, y: y + (Math.random() - 0.5) * 50, r: 2 + Math.random() * 5, vy: 0.8 + Math.random() * 1.6, phase: Math.random() * 6.28, life: 1 });
            }
        };

        const onMove = (e) => {
            if (e.pointerType !== 'mouse') return;
            usingMouse = true;
            target.x = e.clientX;
            target.y = e.clientY;
            dotRef.current.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`;
        };

        // On touch, Thom swims to wherever you tap
        const onDown = (e) => {
            if (e.pointerType === 'mouse') return;
            usingMouse = false;
            target.x = e.clientX;
            target.y = e.clientY;
        };

        const onResize = () => { if (!usingMouse) restingSpot(); };

        const frame = (now) => {
            // Refs detach before the cleanup cancels this loop on the way to an album page
            if (!bodyRef.current) return;
            const s = stateRef.current;
            const dy = window.scrollY - lastScroll;
            lastScroll = window.scrollY;
            vel += (dy - vel) * 0.2;
            if (Math.abs(dy) > 0.5) lastMove = now;
            const moving = now - lastMove < 450;
            const onBoard = window.scrollY < 4 && s.board;
            const body = bodyRef.current;

            // Never let him drift out of view
            let tx = clamp(target.x, 40, window.innerWidth - 40);
            let ty = clamp(target.y, 60, window.innerHeight - 60);
            if (onBoard) {
                // Feet on the end of the board
                tx = s.board.x;
                ty = s.board.y - body.offsetHeight / 2;
            }
            if (!placed && s.board) {
                pos.x = tx;
                pos.y = ty;
                prevX = tx;
                placed = true;
            }
            if (onBoard !== wasStanding) {
                wasStanding = onBoard;
                setStanding(Boolean(onBoard));
                if (!onBoard) {
                    hopV = -9; // spring off the board
                    hovered.current = false;
                }
            }

            if (s.eaten && eatPhase === 0 && s.lure) {
                eatPhase = 1;
                eatStart = now;
            } else if (!s.eaten && eatPhase) {
                if (eatPhase === 3 && s.mouth) burst(s, s.mouth.x, s.mouth.y, 20); // spat back out
                eatPhase = 0;
            }
            let follow = 0.14;
            let targetScale = 1;
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

            pos.x += (tx - pos.x) * follow;
            pos.y += (ty - pos.y) * follow;
            hopY += hopV;
            hopV += 0.7;
            if (hopY >= 0) {
                hopY = 0;
                hopV = 0;
            }
            const vx = pos.x - prevX;
            prevX = pos.x;

            // Head-down going deeper, head-up coming back, upright at rest
            const targetRot = !onBoard && moving && vel > 0 ? 180 : 0;
            rot += (targetRot + (onBoard ? 0 : clamp(vx * 1.5, -20, 20)) - rot) * 0.08;
            const hidden = !onBoard && (moving || Math.abs(rot) > 30);
            sil += ((hidden ? 1 : 0) - sil) * 0.12;
            gear += (s.gear - gear) * 0.1;
            tip += ((onBoard && hovered.current ? 1 : 0) - tip) * 0.15;

            s.thom.x = pos.x;
            s.thom.y = pos.y + hopY;

            wrapRef.current.style.transform = `translate3d(${pos.x}px,${pos.y + hopY}px,0)`;
            body.style.transform = `translate(-50%,-50%) rotate(${rot}deg) scale(${eatScale})`;
            body.style.filter = sil > 0.01
                ? `brightness(${1 - sil}) drop-shadow(0 0 ${4 + 6 * sil}px rgba(159,230,255,${0.55 * sil}))`
                : 'none';
            outfitRefs.current.forEach((img, i) => {
                img.style.opacity = clamp(1 - Math.abs(gear - i), 0, 1);
            });

            const left = pos.x > window.innerWidth * 0.6;
            tipRef.current.style.opacity = tip;
            tipRef.current.style.transform = `translate(${left ? 'calc(-100% - 80px)' : '80px'}, -50%) scale(${0.9 + tip * 0.1})`;

            if (s.depth > 0 && eatPhase < 3) {
                const rate = moving ? 0.35 : gear > 0.5 ? 0.025 : 0;
                if (Math.random() < rate) {
                    s.bubbles.push({ x: pos.x + (Math.random() - 0.5) * 30, y: pos.y + (Math.random() - 0.5) * 30, r: 2 + Math.random() * 4, vy: 0.8 + Math.random() * 1.2, phase: Math.random() * 6.28, life: 1 });
                }
            }

            raf = requestAnimationFrame(frame);
        };

        raf = requestAnimationFrame(frame);
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerdown', onDown);
        window.addEventListener('resize', onResize);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerdown', onDown);
            window.removeEventListener('resize', onResize);
        };
    }, [stateRef]);

    return (
        <>
            <div ref={dotRef} className="fixed top-0 left-0 z-[200] pointer-events-none hidden pointer-fine:block">
                <div className="w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full bg-[#9fe6ff] shadow-[0_0_8px_#9fe6ff]" />
            </div>

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

                <div ref={tipRef} className="water-tip absolute top-0 left-0 w-56 md:w-64 p-5 opacity-0" aria-hidden={!standing}>
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
