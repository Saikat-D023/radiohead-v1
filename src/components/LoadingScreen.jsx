import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function LoadingScreen({ onComplete }) {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let currentProgress = 0;
        let frameId;

        const updateProgress = () => {
            currentProgress += Math.random() * 2;
            if (currentProgress > 100) currentProgress = 100;
            setProgress(Math.floor(currentProgress));

            if (currentProgress < 100) {
                frameId = requestAnimationFrame(updateProgress);
            } else {
                gsap.to(containerRef.current, {
                    yPercent: -100,
                    duration: 1.5,
                    ease: 'power4.inOut',
                    delay: 0.5,
                    onComplete: () => {
                        if (onComplete) onComplete();
                    }
                });
            }
        };

        frameId = requestAnimationFrame(updateProgress);
        return () => cancelAnimationFrame(frameId);
    }, [onComplete]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[9999] bg-[var(--color-void)] flex flex-col items-center justify-center text-[var(--color-ghost)]"
        >
            <div className="font-mono text-xs uppercase tracking-widest opacity-50 mb-4 animate-pulse">
                System Initializing
            </div>
            <div
                ref={textRef}
                className="text-8xl md:text-9xl font-sans font-bold tracking-tighter mix-blend-difference"
            >
                {progress}%
            </div>
        </div>
    );
}
