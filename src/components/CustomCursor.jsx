import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
    const cursorRef = useRef(null);

    useEffect(() => {
        const cursor = cursorRef.current;
        if (!cursor) return;

        // Continuous spinning animation
        gsap.to(cursor, {
            rotation: 360,
            duration: 4,
            repeat: -1,
            ease: 'linear'
        });

        const onMouseMove = (e) => {
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.15,
                ease: 'power2.out'
            });
        };

        const onMouseDown = () => {
            gsap.to(cursor, { scale: 0.8, duration: 0.2 });
        };

        const onMouseUp = () => {
            gsap.to(cursor, { scale: 1.2, duration: 0.2 });
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
            className="fixed top-0 left-0 w-8 h-8 pointer-events-none mix-blend-difference z-[10000] -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center text-white opacity-80"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2v20" />
                <path d="M2 12h20" />
                <path d="M4.93 4.93l14.14 14.14" />
                <path d="M4.93 19.07L19.07 4.93" />
            </svg>
        </div>
    );
}
