'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Preloader({ onComplete }) {
    const containerRef = useRef(null);

    useEffect(() => {
        const tl = gsap.timeline({
            onComplete: () => {
                // Preloader fades out
                gsap.to(containerRef.current, {
                    opacity: 0,
                    duration: 1.0,
                    ease: 'power2.inOut',
                    pointerEvents: 'none',
                    onComplete,
                });

                // Hero simultaneously blurs in
                gsap.fromTo('.hero-container',
                    { scale: 0.96, opacity: 0, filter: 'blur(14px)' },
                    {
                        scale: 1, opacity: 1, filter: 'blur(0px)',
                        duration: 1.8, ease: 'power3.out',
                    }
                );
            }
        });

        // Adding a 3.5 second delay before fading out to allow the SVG animation to play
        tl.to({}, { duration: 3.5 });

        return () => tl.kill();
    }, [onComplete]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090b] overflow-hidden"
        >
            {/* Radial atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(20,20,30,0.8)_0%,rgba(9,9,11,1)_100%)] pointer-events-none" />

            <div className="relative z-10 flex justify-center items-center w-full h-full">
                {/* 
                    Using the GIF and applying CSS tricks to "increase resolution" and sharpness.
                    A combination of contrast, brightness, and crisp-edges helps make blurry
                    anti-aliased edges in GIFs look much sharper. 
                */}
                <img 
                    src="/handwriting-1782115930735.gif" 
                    alt="Signature Animation" 
                    className="w-full max-w-[600px] md:max-w-[800px] h-auto object-contain"
                    style={{ 
                        // Invert if it's dark text on light bg, and increase contrast drastically to sharpen edges.
                        // Also apply a subtle drop shadow to give it a glowing pen effect.
                        filter: 'invert(1) contrast(200%) brightness(120%) drop-shadow(0 0 10px rgba(255,255,255,0.2))',
                        imageRendering: 'pixelated', // Forcing pixelated rendering gives the sharpest edge when scaled up immensely
                        mixBlendMode: 'screen', // This will make the inverted black background completely transparent
                    }}
                />
            </div>
        </div>
    );
}
