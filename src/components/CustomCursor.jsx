import React, { useEffect, useRef } from 'react';

const INTERACTIVE = 'a, button, [role="button"], input, label, select, textarea';

// A little pixel fish replaces the cursor everywhere. With `hideOnScroll` it ducks
// out of sight while the page scrolls, so Thom has the water to himself.
export default function CustomCursor({ hideOnScroll = false }) {
    const posRef = useRef(null);
    const scaleRef = useRef(null);

    useEffect(() => {
        if (!window.matchMedia('(pointer: fine)').matches) return undefined;
        const el = posRef.current;
        const scaleEl = scaleRef.current;
        let seen = false;
        let away = false;
        let scrolling = false;
        let pressed = false;
        let hot = false;
        let timer = 0;

        const show = () => {
            el.style.opacity = seen && !away && !scrolling ? 1 : 0;
        };
        const size = () => {
            scaleEl.style.transform = `scale(${(hot ? 1.35 : 1) * (pressed ? 0.8 : 1)})`;
        };

        const onMove = (e) => {
            if (e.pointerType !== 'mouse') return;
            el.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`;
            seen = true;
            away = false;
            hot = Boolean(e.target.closest?.(INTERACTIVE));
            size();
            show();
        };
        const onScroll = () => {
            if (!hideOnScroll) return;
            scrolling = true;
            show();
            clearTimeout(timer);
            timer = setTimeout(() => {
                scrolling = false;
                show();
            }, 450);
        };
        const onLeave = () => {
            away = true;
            show();
        };
        const onDown = () => {
            pressed = true;
            size();
        };
        const onUp = () => {
            pressed = false;
            size();
        };

        document.documentElement.classList.add('fish-cursor');
        window.addEventListener('pointermove', onMove);
        window.addEventListener('scroll', onScroll, { passive: true });
        document.documentElement.addEventListener('mouseleave', onLeave);
        window.addEventListener('pointerdown', onDown);
        window.addEventListener('pointerup', onUp);
        return () => {
            clearTimeout(timer);
            document.documentElement.classList.remove('fish-cursor');
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('scroll', onScroll);
            document.documentElement.removeEventListener('mouseleave', onLeave);
            window.removeEventListener('pointerdown', onDown);
            window.removeEventListener('pointerup', onUp);
        };
    }, [hideOnScroll]);

    return (
        <div
            ref={posRef}
            className="fixed top-0 left-0 z-[10001] pointer-events-none opacity-0 transition-opacity duration-300 hidden pointer-fine:block"
            aria-hidden="true"
        >
            {/* The hotspot is the fish's open mouth, top left of the sprite */}
            <div ref={scaleRef} className="-ml-[2px] -mt-[4px] origin-[2px_4px] transition-transform duration-200">
                <img src="/fish-cursor.svg" alt="" className="fish-wiggle block w-8 h-8 drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)]" draggable="false" />
            </div>
        </div>
    );
}
