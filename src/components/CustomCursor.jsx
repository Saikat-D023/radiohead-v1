import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
    const cursorRef = useRef(null);

    useEffect(() => {
        const cursor = cursorRef.current;
        if (!cursor) return;

        const onMouseMove = (e) => {
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1,
                ease: 'power2.out'
            });
        };

        const onMouseDown = () => {
            gsap.to(cursor, { scale: 0.8, duration: 0.2 });
        };

        const onMouseUp = () => {
            gsap.to(cursor, { scale: 1, duration: 0.2 });
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, []);

    return (
        <div
            ref={cursorRef}
            className="fixed top-0 left-0 w-6 h-6 border focus:outline-none border-white/50 rounded-full pointer-events-none mix-blend-difference z-[10000] -translate-x-1/2 -translate-y-1/2 hidden md:block"
        />
    );
}
