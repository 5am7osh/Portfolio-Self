'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

export default function Footer() {
    const buttonRef = useRef(null);
    const textRef = useRef(null);
    const [time, setTime] = useState(new Date());

    // Live clock for Riga, Latvia
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Magnetic Button Logic
    useEffect(() => {
        const btn = buttonRef.current;
        const txt = textRef.current;

        const onMouseMove = (e) => {
            const rect = btn.getBoundingClientRect();
            // Calculate cursor position relative to the center of the button
            const x = (e.clientX - rect.left - rect.width / 2) * 0.3; // 0.3 multiplier controls the pull strength
            const y = (e.clientY - rect.top - rect.height / 2) * 0.3;

            gsap.to(btn, { x, y, duration: 0.8, ease: "power3.out" });
            gsap.to(txt, { x: x * 0.5, y: y * 0.5, duration: 0.8, ease: "power3.out" });
        };

        const onMouseLeave = () => {
            gsap.to(btn, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
            gsap.to(txt, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
        };

        btn.addEventListener('mousemove', onMouseMove);
        btn.addEventListener('mouseleave', onMouseLeave);

        return () => {
            btn.removeEventListener('mousemove', onMouseMove);
            btn.removeEventListener('mouseleave', onMouseLeave);
        };
    }, []);

    // Helper to format Riga time. Since the server time might be different, 
    // we use a simplified approach relying on Intl.DateTimeFormat
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Riga',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    return (
        <footer id="contact" className="relative w-full min-h-screen bg-zinc-950 flex flex-col justify-between pt-24 pb-8 overflow-hidden z-20">

            {/* Structural loop video background for the footer vibe */}
            <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover grayscale mix-blend-screen"
                >
                    <source src="/Footer Bg.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950"></div>
            </div>

            {/* Main Content Grid */}
            <div className="relative z-10 container mx-auto px-6 md:px-12 flex-grow flex flex-col justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-8 items-center">

                    {/* Left Column: The Bridge Copy */}
                    <div className="flex flex-col gap-8 max-w-xl">
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-zinc-100 uppercase tracking-tighter leading-[0.9]">
                            The vision <span className="text-zinc-500">starts here.</span>
                        </h2>
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-zinc-100 uppercase tracking-tighter leading-[0.9]">
                            The execution happens at&nbsp;
                            <br />
                            <span className="text-[#e58a59] whitespace-nowrap">The Lead Agents.</span>
                        </h2>
                    </div>

                    {/* Right Column: Magnetic CTA */}
                    <div className="flex justify-center md:justify-end items-center h-[220px] md:h-[300px]">
                        <a
                            href="https://theleadagents.co.uk/contact"
                            target="_blank"
                            rel="noopener noreferrer"
                            ref={buttonRef}
                            className="relative overflow-hidden group rounded-full w-52 h-52 md:w-80 md:h-80 flex items-center justify-center bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all duration-500 hover:scale-105 cursor-pointer"
                        >
                            {/* The Text and Logo Payload */}
                            <div ref={textRef} className="relative z-20 flex flex-col items-center gap-3 pointer-events-none">
                                <span className="text-xs md:text-xl tracking-[0.3em] text-zinc-300 font-mono uppercase text-center">Scale With</span>
                                <img src="/Logo.svg" alt="The Lead Agents Logo" className="w-64 md:w-72" />
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Metadata */}
            <div className="relative z-10 container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-end md:items-center mt-24 border-t border-zinc-900 pt-8 font-mono text-sm tracking-widest text-zinc-500 uppercase">
                <div className="flex flex-col md:flex-row gap-4 md:gap-12 mb-8 md:mb-0">
                    <div className="flex flex-col">
                        <span className="text-zinc-700 text-xs mb-1">Local Time</span>
                        <span className="text-zinc-300">Riga, Latvia — {formatter.format(time)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-zinc-700 text-xs mb-1">Status</span>
                        <span className="text-green-500 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Accepting New Projects
                        </span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 md:gap-12 text-right md:text-left">
                    <a href="https://www.instagram.com/theleadagentshq/" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-100 transition-colors">
                        @TheLeadAgentsHQ
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-100 transition-colors">
                        LinkedIn
                    </a>
                </div>
            </div>
        </footer>
    );
}
