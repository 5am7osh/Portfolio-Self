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

        // Take exactly 3 seconds to load
        tl.to({}, { duration: 3.0 });

        return () => tl.kill();
    }, [onComplete]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090b] overflow-hidden"
        >
            <style>{`
                .loader {
                  width: 0;
                  height: 4.8px;
                  display: block; /* changed to block so it can grow freely */
                  position: relative;
                  background: #FFF;
                  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                  box-sizing: border-box;
                  animation: animFw 3s linear forwards; /* changed to 3s forwards to match GSAP timeline */
                }
                .loader::after,
                .loader::before {
                  content: '';
                  width: 10px;
                  height: 1px;
                  background: #FFF;
                  position: absolute;
                  top: 9px;
                  right: -2px;
                  opacity: 0;
                  transform: rotate(-45deg) translateX(0px);
                  box-sizing: border-box;
                  animation: coli1 0.3s linear infinite;
                }
                .loader::before {
                  top: -4px;
                  transform: rotate(45deg);
                  animation: coli2 0.3s linear infinite;
                }

                @keyframes animFw {
                  0% {
                    width: 0;
                  }
                  100% {
                    width: 100%;
                  }
                }

                @keyframes coli1 {
                  0% {
                    transform: rotate(-45deg) translateX(0px);
                    opacity: 0.7;
                  }
                  100% {
                    transform: rotate(-45deg) translateX(-45px);
                    opacity: 0;
                  }
                }

                @keyframes coli2 {
                  0% {
                    transform: rotate(45deg) translateX(0px);
                    opacity: 1;
                  }
                  100% {
                    transform: rotate(45deg) translateX(-45px);
                    opacity: 0.7;
                  }
                }
            `}</style>
            
            {/* Radial atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(20,20,30,0.8)_0%,rgba(9,9,11,1)_100%)] pointer-events-none" />

            {/* Positioned on the left side, spanning the full screen width */}
            <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 z-10">
                <span className="loader"></span>
            </div>
        </div>
    );
}
