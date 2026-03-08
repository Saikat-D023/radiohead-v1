import React from 'react';

export default function MarqueeCrown() {
    const words = ["THE AMNESIAC", "KID A", "IN RAINBOWS", "OK COMPUTER", "THE BENDS", "HAIL TO THE THIEF", "A MOON SHAPED POOL", "THE KING OF LIMBS", "PABLO HONEY"];

    return (
        <div className="w-full py-16 border-y border-white/5 bg-[var(--color-void)] overflow-hidden flex whitespace-nowrap group">
            <div className="flex animate-marquee">
                {[...words, ...words].map((word, i) => (
                    <span
                        key={i}
                        className="text-6xl md:text-8xl lg:text-9xl font-black uppercase text-transparent tracking-tighter mx-8 transition-colors duration-500 hover:text-[var(--color-plasma)] hover:stroke-none cursor-default"
                        style={{ WebkitTextStroke: '2px var(--color-static)' }}
                    >
                        {word}
                    </span>
                ))}
            </div>
        </div>
    );
}
