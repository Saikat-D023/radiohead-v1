import React, { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function AudioPlayer() {
    const [isPlaying, setIsPlaying] = useState(true);
    const audioRef = useRef(null);
    const hasInteracted = useRef(false);

    useEffect(() => {
        const audio = new Audio('/audio.mp3');
        audio.loop = true;
        audio.volume = 0.5;
        audioRef.current = audio;

        // Try to play immediately (might be blocked by browser autoplay policy)
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Autoplay was prevented. Wait for user interaction.
                setIsPlaying(false);
            });
        }


        const handleInteraction = () => {
            if (!hasInteracted.current && audioRef.current) {
                audioRef.current.play().then(() => {
                    setIsPlaying(true);
                    hasInteracted.current = true;
                }).catch(e => console.error("Audio playback failed:", e));
            }
        };

        // Add event listeners for interaction to trigger play if blocked
        window.addEventListener('click', handleInteraction);
        window.addEventListener('keydown', handleInteraction);
        window.addEventListener('scroll', handleInteraction);

        return () => {
             if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
            window.removeEventListener('scroll', handleInteraction);
        };
    }, []);

    const togglePlay = (e) => {
        // Prevent click from propagating to window and re-triggering play
        e.stopPropagation(); 
        
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play();
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
