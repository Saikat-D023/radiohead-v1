import React from 'react';

// Spots on the 900×375 fish layers, as % of the sprite
const JOINT = '31.1% 60%';
const MOUTH = { left: '76.7%', top: '57.3%' };
const RED_LURE = { left: '88.3%', top: '38.7%' };
const BLUE_LURE = { left: '93.7%', top: '22.7%' };
const EYE = { left: '72.8%', top: '41.3%' };
const VENT = { left: '36%', top: '64%' };

// The Karma Fish, painted, facing right. The tail is its own layer and swishes
// from its base; the lures pulse red and blue like police lights.
// mouthRef / lureRef mark where Thom gets lured to and swallowed, ventRef where he comes back out.
export default function KarmaFish({ mouthRef, lureRef, flashRef, ventRef }) {
    return (
        <div className="relative w-full" style={{ aspectRatio: '900 / 375' }} aria-hidden="true">
            <img src="/karma-fish-tail.webp" alt="" draggable="false" className="kf-tail absolute inset-0 w-full h-full" style={{ transformOrigin: JOINT }} />
            <img src="/karma-fish-body.webp" alt="" draggable="false" className="absolute inset-0 w-full h-full" />

            <div className="absolute" style={RED_LURE}>
                <div className="kf-light w-16 h-16 -ml-8 -mt-8 rounded-full bg-[radial-gradient(circle,rgba(255,60,80,0.7),transparent_65%)] mix-blend-screen" />
            </div>
            <div className="absolute" style={BLUE_LURE}>
                <div className="kf-light kf-light-alt w-16 h-16 -ml-8 -mt-8 rounded-full bg-[radial-gradient(circle,rgba(80,190,255,0.7),transparent_65%)] mix-blend-screen" />
            </div>
            <div className="absolute" style={EYE}>
                <div className="kf-eye w-10 h-10 -ml-5 -mt-5 rounded-full bg-[radial-gradient(circle,rgba(120,230,255,0.6),transparent_65%)] mix-blend-screen" />
            </div>

            <div ref={lureRef} className="absolute" style={RED_LURE} />
            <div ref={ventRef} className="absolute" style={VENT} />
            <div ref={mouthRef} className="absolute" style={MOUTH}>
                <div ref={flashRef} className="w-40 h-40 -ml-20 -mt-20 rounded-full bg-[radial-gradient(circle,rgba(200,240,255,0.8),transparent_60%)] mix-blend-screen opacity-0" />
            </div>
        </div>
    );
}
