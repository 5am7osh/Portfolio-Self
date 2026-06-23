'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { MorphingText } from '@/components/MorphingText';

// ─── Physics Pill Component ─────────────────────────────────────────────────
// Each pill is an absolutely-positioned div with its own velocity state,
// managed via a shared requestAnimationFrame loop in the parent.
function FloatingPill({ label, color, glowRgb, pillRef }) {
    return (
        <div
            ref={pillRef}
            className="absolute z-30 border border-zinc-800 rounded-full px-6 py-2 backdrop-blur-sm cursor-grab active:cursor-grabbing select-none touch-none"
            style={{ willChange: 'transform' }}
        >
            <span
                className="font-mono text-sm md:text-base tracking-widest uppercase"
                style={{
                    color,
                    textShadow: `0 0 10px ${glowRgb}`,
                }}
            >
                {label}
            </span>
        </div>
    );
}

export default function Hero({ isReady, onExplore }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const nameRef = useRef(null);
    const textBoundsRef = useRef(null);
    const btnWrapperRef = useRef(null);
    const btnContentRef = useRef(null);

    // Refs for the three physics pills
    const pill1Ref = useRef(null);
    const pill2Ref = useRef(null);
    const pill3Ref = useRef(null);

    // ── Canvas Background ────────────────────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width, height;
        let animationFrameId;
        let mouse = { x: -1000, y: -1000 };
        let targetMouse = { x: -1000, y: -1000 };
        const spacing = 40;
        const interactionRadius = 150;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            initDots();
        };

        const onMouseMove = (e) => {
            targetMouse.x = e.clientX;
            targetMouse.y = e.clientY;
        };

        let dots = [];
        const initDots = () => {
            dots = [];
            for (let x = -spacing; x <= width + spacing; x += spacing) {
                for (let y = -spacing; y <= height + spacing; y += spacing) {
                    const isColored = Math.random() < 0.05;
                    const colors = ['#b87333', '#ef4444', '#3b82f6'];
                    const color = isColored ? colors[Math.floor(Math.random() * colors.length)] : null;
                    dots.push({
                        originX: x, originY: y, x, y, vx: 0, vy: 0,
                        phaseX: Math.random() * Math.PI * 2,
                        phaseY: Math.random() * Math.PI * 2,
                        speedX: 0.0005 + Math.random() * 0.0005,
                        speedY: 0.0005 + Math.random() * 0.0005,
                        isColored, color,
                        pulsePhase: Math.random() * Math.PI * 2,
                    });
                }
            }
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', onMouseMove);
        resize();

        const render = () => {
            const time = Date.now();
            mouse.x += (targetMouse.x - mouse.x) * 0.1;
            mouse.y += (targetMouse.y - mouse.y) * 0.1;
            ctx.fillStyle = '#09090b';
            ctx.fillRect(0, 0, width, height);

            for (let i = 0; i < dots.length; i++) {
                const d = dots[i];
                const swayX = d.originX + Math.sin(time * d.speedX + d.phaseX) * 4;
                const swayY = d.originY + Math.cos(time * d.speedY + d.phaseY) * 4;
                const dx = mouse.x - d.x;
                const dy = mouse.y - d.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                let tX = swayX, tY = swayY, bright = 1;
                if (dist < interactionRadius) {
                    const f = (interactionRadius - dist) / interactionRadius;
                    tX -= (dx / dist) * f * 50;
                    tY -= (dy / dist) * f * 50;
                    bright = 1 + f * 3;
                }
                d.vx += (tX - d.x) * 0.08; d.vy += (tY - d.y) * 0.08;
                d.vx *= 0.75; d.vy *= 0.75;
                d.x += d.vx; d.y += d.vy;

                let opacity = d.isColored
                    ? 0.3 + 0.7 * Math.abs(Math.sin(time * 0.001 + d.pulsePhase))
                    : Math.min(0.8, 0.1 * bright);

                ctx.beginPath();
                ctx.arc(d.x, d.y, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = d.isColored ? d.color : `rgba(255,255,255,${opacity})`;
                ctx.globalAlpha = d.isColored ? opacity : 1;
                ctx.fill();
                ctx.globalAlpha = 1;
            }
            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // ── Physics-Based Floating Pills ─────────────────────────────────────────
    useEffect(() => {
        const pillRefs = [pill1Ref, pill2Ref, pill3Ref];
        const pills = pillRefs.map((ref, i) => {
            const el = ref.current;
            if (!el) return null;
            const w = window.innerWidth;
            const h = window.innerHeight;

            // Spread initial positions safely outside the center bounding box
            const positions = [
                { x: w * 0.05, y: h * 0.05 },
                { x: w * 0.75, y: h * 0.05 },
                { x: w * 0.4, y: h * 0.85 },
            ];

            return {
                el,
                x: positions[i].x,
                y: positions[i].y,
                // Gentle initial random drift velocities
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                isDragging: false,
                lastMouseX: 0,
                lastMouseY: 0,
                dragOffsetX: 0,
                dragOffsetY: 0,
            };
        }).filter(Boolean);

        let animId;

        // Position pills initially
        pills.forEach(p => {
            p.el.style.left = `${p.x}px`;
            p.el.style.top = `${p.y}px`;
        });

        // Physics loop
        const tick = () => {
            const W = window.innerWidth;
            const H = window.innerHeight;

            pills.forEach(p => {
                if (p.isDragging) return;

                p.x += p.vx;
                p.y += p.vy;

                // Bounce off walls with damping
                const pw = p.el.offsetWidth;
                const ph = p.el.offsetHeight;

                if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx) * 0.85; }
                if (p.x + pw > W) { p.x = W - pw; p.vx = -Math.abs(p.vx) * 0.85; }
                if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy) * 0.85; }
                if (p.y + ph > H) { p.y = H - ph; p.vy = -Math.abs(p.vy) * 0.85; }

                // --- Center Exclusion Zone (Strict AABB Collision & Cushion) ---
                if (textBoundsRef.current && !p.isDragging) {
                    const visibleSpan = textBoundsRef.current.querySelector('span:not(.invisible)');
                    const tRect = visibleSpan ? visibleSpan.getBoundingClientRect() : textBoundsRef.current.getBoundingClientRect();
                    // Add a tiny bit of padding so they don't clip the edges of the font glyphs
                    const pad = 2; // limit exactly to the letters with tight padding
                    const tLeft = tRect.left - pad;
                    const tRight = tRect.right + pad;
                    const tTop = tRect.top - pad;
                    const tBottom = tRect.bottom + pad;

                    const pLeft = p.x;
                    const pRight = p.x + pw;
                    const pTop = p.y;
                    const pBottom = p.y + ph;

                    // Check for overlap between pill rect and text rect
                    if (pRight > tLeft && pLeft < tRight && pBottom > tTop && pTop < tBottom) {
                        // Collision occurred! Find the shallowest penetration depth to resolve it
                        const overlapLeft = pRight - tLeft;
                        const overlapRight = tRight - pLeft;
                        const overlapTop = pBottom - tTop;
                        const overlapBottom = tBottom - pTop;

                        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                        // Cushion bounce: absorbs energy instead of accelerating (trampoline)
                        const bounce = 0.4;

                        if (minOverlap === overlapLeft) {
                            p.x = tLeft - pw;
                            if (p.vx > 0) p.vx = -p.vx * bounce;
                        } else if (minOverlap === overlapRight) {
                            p.x = tRight;
                            if (p.vx < 0) p.vx = -p.vx * bounce;
                        } else if (minOverlap === overlapTop) {
                            p.y = tTop - ph;
                            if (p.vy > 0) p.vy = -p.vy * bounce;
                        } else if (minOverlap === overlapBottom) {
                            p.y = tBottom;
                            if (p.vy < 0) p.vy = -p.vy * bounce;
                        }
                    }
                }

                // Very slight friction so they never fully stop
                p.vx *= 0.999;
                p.vy *= 0.999;

                // Nudge if nearly stopped to keep them alive
                if (Math.abs(p.vx) < 0.3) p.vx += (Math.random() - 0.5) * 0.2;
                if (Math.abs(p.vy) < 0.3) p.vy += (Math.random() - 0.5) * 0.2;

                p.el.style.left = `${p.x}px`;
                p.el.style.top = `${p.y}px`;
            });

            animId = requestAnimationFrame(tick);
        };

        tick();

        // ── Drag & Throw ──────────────────────────────────────────────────────
        const handlers = pills.map(p => {
            let prevX = 0, prevY = 0;
            let velX = 0, velY = 0;

            const onPointerDown = (e) => {
                e.preventDefault();
                p.isDragging = true;
                p.el.style.cursor = 'grabbing';
                p.el.setPointerCapture(e.pointerId);
                p.dragOffsetX = e.clientX - p.x;
                p.dragOffsetY = e.clientY - p.y;
                prevX = e.clientX;
                prevY = e.clientY;
                velX = 0; velY = 0;
            };

            const onPointerMove = (e) => {
                if (!p.isDragging) return;
                velX = e.clientX - prevX;
                velY = e.clientY - prevY;
                prevX = e.clientX;
                prevY = e.clientY;
                p.x = e.clientX - p.dragOffsetX;
                p.y = e.clientY - p.dragOffsetY;
                p.el.style.left = `${p.x}px`;
                p.el.style.top = `${p.y}px`;
            };

            const onPointerUp = () => {
                p.isDragging = false;
                p.el.style.cursor = 'grab';
                // Throw velocity — scale up for more satisfying throw feel
                p.vx = velX * 1.2;
                p.vy = velY * 1.2;
            };

            p.el.addEventListener('pointerdown', onPointerDown);
            p.el.addEventListener('pointermove', onPointerMove);
            p.el.addEventListener('pointerup', onPointerUp);
            p.el.addEventListener('pointercancel', onPointerUp);

            return { el: p.el, onPointerDown, onPointerMove, onPointerUp };
        });

        return () => {
            cancelAnimationFrame(animId);
            handlers.forEach(({ el, onPointerDown, onPointerMove, onPointerUp }) => {
                el.removeEventListener('pointerdown', onPointerDown);
                el.removeEventListener('pointermove', onPointerMove);
                el.removeEventListener('pointerup', onPointerUp);
                el.removeEventListener('pointercancel', onPointerUp);
            });
        };
    }, [isReady]);

    // ── Entrance Animation ────────────────────────────────────────────────────
    useEffect(() => {
        if (!isReady) return;
        const tl = gsap.timeline();

        tl.fromTo(canvasRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 2.5, ease: "power2.inOut" }
        );

        tl.fromTo(nameRef.current,
            { scale: 1.2, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1.5, ease: "expo.out" },
            "-=2"
        );

        tl.fromTo([pill1Ref.current, pill2Ref.current, pill3Ref.current],
            { opacity: 0, scale: 0.6 },
            { opacity: 1, scale: 1, duration: 1, stagger: 0.15, ease: "back.out(1.7)" },
            "-=1"
        );

        tl.fromTo(btnWrapperRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
            "-=0.8"
        );

        return () => tl.kill();
    }, [isReady]);

    // ── Name Parallax ─────────────────────────────────────────────────────────
    useEffect(() => {
        const handle = (e) => {
            const xPos = (e.clientX / window.innerWidth) - 0.5;
            const yPos = (e.clientY / window.innerHeight) - 0.5;
            if (nameRef.current) {
                gsap.to(nameRef.current, { x: xPos * -30, y: yPos * -30, duration: 1.5, ease: "power2.out" });
            }
        };
        window.addEventListener('mousemove', handle);
        return () => window.removeEventListener('mousemove', handle);
    }, []);

    // ── CTA Magnetic ─────────────────────────────────────────────────────────
    useEffect(() => {
        const wrapper = btnWrapperRef.current;
        const content = btnContentRef.current;
        const onMove = (e) => {
            const rect = wrapper.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.5;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.5;
            gsap.to(content, { x, y, duration: 0.5, ease: "power2.out" });
        };
        const onLeave = () => gsap.to(content, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
        if (wrapper) {
            wrapper.addEventListener('mousemove', onMove);
            wrapper.addEventListener('mouseleave', onLeave);
        }
        return () => {
            if (wrapper) {
                wrapper.removeEventListener('mousemove', onMove);
                wrapper.removeEventListener('mouseleave', onLeave);
            }
        };
    }, []);

    return (
        <section
            ref={containerRef}
            id="home"
            className="relative w-full h-screen bg-[#09090b] overflow-hidden hero-container"
        >
            {/* Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-0" />

            {/* Physics Pills — positioned absolutely at top-left, moved by JS */}
            <FloatingPill
                pillRef={pill1Ref}
                label="FRONTEND DEVELOPER"
                color="#3b82f6"
                glowRgb="rgba(59,130,246,0.6)"
            />
            <FloatingPill
                pillRef={pill2Ref}
                label="DESIGNER"
                color="#b87333"
                glowRgb="rgba(184,115,51,0.6)"
            />
            <FloatingPill
                pillRef={pill3Ref}
                label="TECHNICAL FOUNDER"
                color="#ef4444"
                glowRgb="rgba(239,68,68,0.6)"
            />

            {/* Center Name */}
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <div
                    ref={nameRef}
                    className="w-full text-[10.5vw] md:text-[7.5vw] font-black tracking-tighter leading-none text-zinc-100 mix-blend-screen text-center select-none"
                >
                    <div ref={textBoundsRef} className="inline-block w-fit">
                        <MorphingText
                            texts={["SAMUEL J\nPRABAHAR", "சாமுவேல் ஜோ\nபிரபாகர்"]}
                            className="h-[1.7em]"
                        />
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
                <div 
                    ref={btnWrapperRef} 
                    className="relative inline-block w-fit opacity-0 cursor-pointer p-8 -m-8"
                    onClick={onExplore}
                >
                    <button
                        ref={btnContentRef}
                        className="bg-transparent text-xs tracking-[0.2em] text-zinc-300 px-10 py-4 border border-zinc-700 pointer-events-none rounded-sm uppercase"
                    >
                        EXPLORE THE ARCHITECTURE
                    </button>
                </div>
            </div>
        </section>
    );
}