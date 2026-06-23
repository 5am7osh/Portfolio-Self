'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import Link from 'next/link';

// ─── Project Data ────────────────────────────────────────────────────────────
const PROJECTS = [
    {
        id: 'localthread',
        name: 'LOCALTHREAD',
        subtitle: 'Hyper-Local Community Platform',
        media: '/LT card.mp4',
        accent: 'from-violet-900/60 via-purple-950/80 to-zinc-950',
        href: '/work/localthread',
    },
    {
        id: 'pearl',
        name: 'PEARL',
        subtitle: 'Service Management SaaS',
        media: '/Pearl Card.mp4',
        accent: 'from-sky-900/60 via-blue-950/80 to-zinc-950',
        href: '/work/pearl',
    },
    {
        id: 'leadagents',
        name: 'THE LEAD AGENTS',
        subtitle: 'Digital Infrastructure & Scale',
        media: '/TLA card.mp4',
        accent: 'from-amber-900/60 via-orange-950/80 to-zinc-950',
        href: 'https://theleadagents.co.uk/',
    },
];

// ─── Floating Hover Card ─────────────────────────────────────────────────────
// Rendered via Portal into document.body so `fixed` is always viewport-relative
// regardless of any parent CSS transform (e.g. GSAP pin transforms).
function HoverCard({ cardRef, project }) {
    return (
        <div
            ref={cardRef}
            className="fixed top-0 left-0 pointer-events-none z-[9999] w-[80vw] md:w-[60vw] max-w-[700px] flex flex-col p-4 md:p-5 backdrop-blur-2xl border border-white/10 bg-white/5 rounded-[2rem] shadow-2xl gap-4"
            style={{ opacity: 0, transform: 'scale(0.85)', willChange: 'transform, opacity' }}
        >
            {/* The Screen Enclosure */}
            <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden bg-zinc-950 relative border border-white/5 shadow-inner">
                {project?.media && (
                    <video
                        key={project.id}
                        src={project.media}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="object-cover w-full h-full absolute inset-0"
                    />
                )}
            </div>

            {/* The Dedicated Text Panel (Clean Glass Area) */}
            {project && (
                <div className="flex flex-col items-start px-2 pb-1">
                    <span className="font-mono text-[10px] md:text-xs tracking-[0.2em] text-zinc-400 uppercase mb-1">
                        {project.subtitle}
                    </span>
                    <h3 className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase">
                        {project.name}
                    </h3>
                </div>
            )}
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function SystemsBuilt() {
    const sectionRef     = useRef(null);
    const bottomBarRef   = useRef(null);
    const cardRef        = useRef(null);
    const xMoveRef       = useRef(null);
    const yMoveRef       = useRef(null);
    const cardVisibleRef = useRef(false);
    // Live cursor position so we can snap the card there before fade-in
    const cursorRef      = useRef({ x: 0, y: 0 });

    const [activeProject, setActiveProject] = useState(null);
    const [portalTarget, setPortalTarget] = useState(null);

    useEffect(() => {
        setPortalTarget(document.body);
    }, []);

    // ── Shared hide helper ─────────────────────────────────────────────────
    const hideCard = useCallback(() => {
        if (!cardVisibleRef.current) return;
        cardVisibleRef.current = false;
        gsap.killTweensOf(cardRef.current, 'opacity,scale');
        gsap.to(cardRef.current, {
            opacity: 0,
            scale: 0.85,
            duration: 0.3,
            ease: 'power3.in',
            onComplete: () => setActiveProject(null),
        });
    }, []);

    // ── Boot GSAP on mount (waits for Portal target) ───────────────────────
    useEffect(() => {
        if (!portalTarget) return;

        const card = cardRef.current;
        if (!card) return;

        // Start fully hidden and at (0,0) — will be repositioned before each reveal
        gsap.set(card, { opacity: 0, scale: 0.85, x: 0, y: 0 });

        xMoveRef.current = gsap.quickTo(card, 'x', { duration: 0.35, ease: 'power3' });
        yMoveRef.current = gsap.quickTo(card, 'y', { duration: 0.35, ease: 'power3' });

        // ── mousemove: track + boundary check ─────────────────────────────
        const checkBounds = (clientY) => {
            if (!cardVisibleRef.current) return;
            let shouldHide = false;

            if (sectionRef.current) {
                const rect = sectionRef.current.getBoundingClientRect();
                // If cursor is vertically outside the section, hide
                if (clientY < rect.top || clientY > rect.bottom) {
                    shouldHide = true;
                }
            }
            
            if (bottomBarRef.current) {
                const barTop = bottomBarRef.current.getBoundingClientRect().top;
                if (clientY >= barTop) {
                    shouldHide = true;
                }
            }

            if (shouldHide) hideCard();
        };

        const onMouseMove = (e) => {
            // Always track cursor — even when card is hidden
            cursorRef.current = { x: e.clientX, y: e.clientY };

            const cardW = cardRef.current?.offsetWidth || 700;
            const cardH = cardRef.current?.offsetHeight || 500;

            const padding = 24; // Safe zone from browser edges
            let targetX = e.clientX - cardW / 2;
            let targetY = e.clientY - cardH / 2;

            // Boundary Clamping
            targetX = Math.max(padding, Math.min(targetX, window.innerWidth - cardW - padding));
            targetY = Math.max(padding, Math.min(targetY, window.innerHeight - cardH - padding));

            xMoveRef.current(targetX);
            yMoveRef.current(targetY);

            checkBounds(e.clientY);
        };

        // ── scroll: check bounds without hiding unconditionally ────────────
        const onScroll = () => {
            if (cardVisibleRef.current) {
                checkBounds(cursorRef.current.y);
            }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('scroll',    onScroll, { passive: true });

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('scroll',    onScroll);
        };
    }, [hideCard, portalTarget]);

    // ── Project text: hover enter ──────────────────────────────────────────
    const handleEnter = (project, e) => {
        cardVisibleRef.current = true;
        // ONLY kill opacity and scale so we don't destroy the quickTo instances for x/y
        gsap.killTweensOf(cardRef.current, 'opacity,scale');

        // Update cursor ref immediately so scroll logic knows where we are
        cursorRef.current = { x: e.clientX, y: e.clientY };

        const cardW = cardRef.current?.offsetWidth || 700;
        const cardH = cardRef.current?.offsetHeight || 500;

        const padding = 24;
        let targetX = e.clientX - cardW / 2;
        let targetY = e.clientY - cardH / 2;

        targetX = Math.max(padding, Math.min(targetX, window.innerWidth - cardW - padding));
        targetY = Math.max(padding, Math.min(targetY, window.innerHeight - cardH - padding));

        // KEY FIX: snap card to the clamped cursor position BEFORE fading in
        // so it never travels from (0,0) to the cursor while visible.
        gsap.set(cardRef.current, {
            x: targetX,
            y: targetY,
        });

        setActiveProject(project);
        gsap.to(cardRef.current, {
            opacity: 1,
            scale: 1,
            duration: 0.45,
            ease: 'power4.out',
        });
    };

    // Leaving a project text = no-op (card follows cursor in blank space)
    const handleTextLeave = () => {};

    // Cursor exited the entire section
    const handleSectionLeave = () => hideCard();

    return (
        <>
            {/* Portal: renders into document.body so fixed = true viewport coords */}
            {portalTarget && createPortal(
                <HoverCard cardRef={cardRef} project={activeProject} />,
                portalTarget
            )}

            <section
                ref={sectionRef}
                id="works"
                className="relative min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-center overflow-hidden"
                onMouseLeave={handleSectionLeave}
            >
                {/* ── Section label ─────────────────────────────────────── */}
                <span className="absolute top-10 left-12 font-mono text-sm md:text-base tracking-[0.3em] text-zinc-400 uppercase select-none font-bold">
                    04 — SYSTEMS BUILT
                </span>

                {/* ── Subtle grid overlay ────────────────────────────────── */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.025]"
                    style={{
                        backgroundImage:
                            'repeating-linear-gradient(0deg,transparent,transparent 79px,rgba(255,255,255,.4) 79px,rgba(255,255,255,.4) 80px),repeating-linear-gradient(90deg,transparent,transparent 79px,rgba(255,255,255,.4) 79px,rgba(255,255,255,.4) 80px)',
                    }}
                />

                {/* ── Project links ──────────────────────────────────────── */}
                <div className="flex flex-col items-center gap-0 md:gap-2 select-none text-center md:text-left">
                    {PROJECTS.map((project, i) => (
                        <div key={project.id} className="relative group">
                            {/* Index ticker */}
                            <span className="absolute -left-10 top-1/2 -translate-y-1/2 font-mono text-[10px] tracking-[0.2em] text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 select-none">
                                0{i + 1}
                            </span>

                            {project.href ? (
                                <Link
                                    href={project.href}
                                    target={project.href.startsWith('http') ? '_blank' : undefined}
                                    rel={project.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                    className={[
                                        'block text-5xl md:text-7xl lg:text-[8rem] font-black uppercase tracking-wide',
                                        'text-zinc-700 hover:text-zinc-100',
                                        'transition-colors duration-300 cursor-pointer leading-none',
                                        'py-3 md:py-4',
                                    ].join(' ')}
                                    onMouseEnter={(e) => handleEnter(project, e)}
                                    onMouseLeave={handleTextLeave}
                                    aria-label={`View ${project.name} project`}
                                >
                                    {project.name}
                                </Link>
                            ) : (
                                <button
                                    className={[
                                        'block text-5xl md:text-7xl lg:text-[8rem] font-black uppercase tracking-wide',
                                        'text-zinc-700 hover:text-zinc-100',
                                        'transition-colors duration-300 cursor-pointer leading-none',
                                        'py-3 md:py-4',
                                    ].join(' ')}
                                    onMouseEnter={(e) => handleEnter(project, e)}
                                    onMouseLeave={handleTextLeave}
                                    aria-label={`View ${project.name} project`}
                                >
                                    {project.name}
                                </button>
                            )}

                            {/* Underline that draws on hover */}
                            <span className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-zinc-100 transition-all duration-500 ease-in-out" />
                        </div>
                    ))}
                </div>

                {/* ── Bottom decoration — also acts as cursor boundary ───── */}
                <div
                    ref={bottomBarRef}
                    className="absolute bottom-10 left-12 right-12 flex items-center justify-between"
                >
                    <span className="font-mono text-[10px] tracking-[0.25em] text-zinc-700 uppercase">
                        Selected work — 2025–26
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.25em] text-zinc-700 uppercase">
                        Hover to preview
                    </span>
                </div>
            </section>
        </>
    );
}
