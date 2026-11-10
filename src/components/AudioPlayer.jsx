import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { Volume2, VolumeX } from 'lucide-react';

const VOLUME = 0.5;

// Sections can switch the soundtrack with:
// window.dispatchEvent(new CustomEvent('soundtrack', { detail: 'weird-fishes' }))
const TRACKS = {
    main: '/audio2.mp3',
    'weird-fishes': '/weird-fishes.mp3',
};

export default function AudioPlayer() {
    const [isPlaying, setIsPlaying] = useState(true);
    const tracksRef = useRef({});
    const currentRef = useRef('main');
    const playingRef = useRef(true);
    const hasInteracted = useRef(false);

    useEffect(() => {
        const tracks = {};
        for (const [name, src] of Object.entries(TRACKS)) {
            const audio = new Audio(src);
            audio.loop = true;
            audio.volume = name === 'main' ? VOLUME : 0;
            audio.preload = name === 'main' ? 'auto' : 'metadata';
            // A missing file just means that track is skipped
            audio.addEventListener('error', () => { tracks[name] = null; });
            tracks[name] = audio;
        }
        tracksRef.current = tracks;

        const current = () => tracksRef.current[currentRef.current];

        // Try to play immediately (might be blocked by browser autoplay policy)
        const playPromise = current().play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Autoplay was prevented. Wait for user interaction.
                playingRef.current = false;
                setIsPlaying(false);
            });
        }

        const handleInteraction = () => {
            if (!hasInteracted.current && current()) {
                current().play().then(() => {
                    playingRef.current = true;
                    setIsPlaying(true);
                    hasInteracted.current = true;
                }).catch(e => console.error("Audio playback failed:", e));
            }
        };

        const handleSoundtrack = (e) => {
            const next = e.detail;
            const nextAudio = tracksRef.current[next];
            const prevAudio = current();
            if (!nextAudio || next === currentRef.current) return;
            currentRef.current = next;

            gsap.to(prevAudio, {
                volume: 0, duration: 1.5, ease: 'power1.out', overwrite: true,
                onComplete: () => prevAudio.pause(),
            });
            if (playingRef.current) {
                nextAudio.volume = 0;
                nextAudio.play().catch(() => {});
                gsap.to(nextAudio, { volume: VOLUME, duration: 2, ease: 'power1.in', overwrite: true });
            } else {
                nextAudio.volume = VOLUME;
            }
        };

        // Add event listeners for interaction to trigger play if blocked
        window.addEventListener('click', handleInteraction);
        window.addEventListener('keydown', handleInteraction);
        window.addEventListener('scroll', handleInteraction);
        window.addEventListener('soundtrack', handleSoundtrack);

        return () => {
            for (const audio of Object.values(tracks)) {
                if (audio) {
                    gsap.killTweensOf(audio);
                    audio.pause();
                }
            }
            tracksRef.current = {};
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
            window.removeEventListener('scroll', handleInteraction);
            window.removeEventListener('soundtrack', handleSoundtrack);
        };
    }, []);

    const togglePlay = (e) => {
        // Prevent click from propagating to window and re-triggering play
        e.stopPropagation();

        const audio = tracksRef.current[currentRef.current];
        if (audio) {
            if (isPlaying) {
                audio.pause();
                playingRef.current = false;
                setIsPlaying(false);
            } else {
                audio.volume = VOLUME;
                audio.play();
                playingRef.current = true;
                setIsPlaying(true);
                hasInteracted.current = true;
            }
        }
    };

    return (
        <button
            onClick={togglePlay}
            className="fixed bottom-6 right-6 z-[100] bg-black/50 p-3 rounded-full backdrop-blur-md border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all"
            aria-label={isPlaying ? "Mute music" : "Play music"}
        >
            {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
    );
}
