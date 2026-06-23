'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import Lenis from 'lenis';
import Preloader from '@/components/Preloader';
import Hero from '@/components/Hero';
import HorizontalJourney from '@/components/HorizontalJourney';
import SystemsBuilt from '@/components/SystemsBuilt';
import Footer from '@/components/Footer';
import LimelightNav, { HomeIcon, AboutIcon, WorksIcon, ContactIcon } from '@/components/LimelightNav';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const isProgrammaticScrollRef = useRef(false);
    const lenisRef = useRef(null);

    // Synchronously force isLoading=true BEFORE the browser paints the cached layout.
    // This entirely defeats the Next.js cache 1-second visual flash!
    useIsomorphicLayoutEffect(() => {
        if (sessionStorage.getItem('returnToWorks')) {
            setIsLoading(true);
        }
    }, []);

    // 1. Initialize Lenis on mount so it's active when child components measure triggers
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.6, // slightly slower for cinematic feel
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential easeOut
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.9, // gentle wheel multiplier
        });
        lenisRef.current = lenis;

        const hasLoaded = sessionStorage.getItem('hasLoaded');
        let rafId;
        const returnToWorks = sessionStorage.getItem('returnToWorks');
        
        if (returnToWorks) {
            setIsLoading(true);
            setTimeout(() => sessionStorage.removeItem('returnToWorks'), 500);
            const startTime = Date.now();
            
            // Force GSAP to calculate its pin spacers INSTANTLY before we start tracking target coordinates.
            ScrollTrigger.refresh();
            
            const lockScrollToWorks = () => {
                if (Date.now() - startTime < 1200) {
                    const worksEl = document.getElementById('works');
                    if (worksEl) {
                        const targetY = worksEl.getBoundingClientRect().top + window.scrollY + 50;
                        window.scrollTo(0, targetY);
                        if (lenisRef.current) lenisRef.current.scrollTo(targetY, { immediate: true, force: true });
                    }
                    rafId = requestAnimationFrame(lockScrollToWorks);
                } else {
                    // Once loop finishes, clear the inline styles we injected during the click
                    const homeContainer = document.getElementById('home-container');
                    if (homeContainer) {
                        homeContainer.style.opacity = '';
                        homeContainer.style.transition = '';
                    }
                }
            };
            rafId = requestAnimationFrame(lockScrollToWorks);
            // We do NOT call setIsLoading(false) here! 
            // The <Preloader /> will finish its animation and call it automatically.
        } else if (!hasLoaded) {
            // Force scroll to top on first visit, aggressively
            const forceTop = () => {
                window.scrollTo(0, 0);
                lenis.scrollTo(0, { immediate: true });
            };
            requestAnimationFrame(forceTop);
            sessionStorage.setItem('hasLoaded', 'true');
            // We do NOT call setIsLoading(false) here! Let the Preloader run.
        } else {
            // Normal navigation (no returnToWorks, and hasLoaded is true).
            // Skip the preloader immediately.
            setIsLoading(false);
        }

        const handleBeforeUnload = () => {
            if (!sessionStorage.getItem('hasLoaded')) {
                window.scrollTo(0, 0);
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Sync GSAP with Lenis scrolling
        lenis.on('scroll', ScrollTrigger.update);

        const updateTicker = (time) => {
            lenis.raf(time * 1000);
        };
        gsap.ticker.add(updateTicker);
        gsap.ticker.lagSmoothing(0);

        // Lock scrolling initially while loading
        lenis.stop();

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            gsap.ticker.remove(updateTicker);
            lenis.destroy();
            lenisRef.current = null;
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, []);

    // 2. Control scroll lock and register trigger sync when load status changes
    useEffect(() => {
        if (isLoading) {
            lenisRef.current?.stop();
            return;
        }

        // Enable scrolling when loading is complete
        lenisRef.current?.start();
        
        if (!sessionStorage.getItem('hasLoaded')) {
            requestAnimationFrame(() => {
                window.scrollTo(0, 0);
                if (lenisRef.current) {
                    lenisRef.current.scrollTo(0, { immediate: true });
                }
            });
            sessionStorage.setItem('hasLoaded', 'true');
        }

        // Track vertical section transitions to update active tab automatically
        const sections = ['#home', '#about', '#works', '#contact'];
        const triggers = sections.map((selector, index) => {
            return ScrollTrigger.create({
                trigger: selector,
                start: 'top 50%',
                end: 'bottom 50%',
                onToggle: (self) => {
                    if (self.isActive && !isProgrammaticScrollRef.current) {
                        setActiveIndex(index);
                    }
                },
            });
        });

        // Recalculate all ScrollTrigger boundaries globally
        ScrollTrigger.refresh();

        const refreshTimer1 = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 100);

        const refreshTimer2 = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 1100);

        return () => {
            triggers.forEach(t => t.kill());
            clearTimeout(refreshTimer1);
            clearTimeout(refreshTimer2);
        };
    }, [isLoading]);

    const scrollToSection = (target, index) => {
        isProgrammaticScrollRef.current = true;
        setActiveIndex(index);

        if (lenisRef.current) {
            lenisRef.current.scrollTo(target, {
                duration: 1.6,
                onComplete: () => {
                    isProgrammaticScrollRef.current = false;
                }
            });
        } else {
            gsap.to(window, {
                duration: 1.6,
                scrollTo: { y: target, autoKill: true },
                ease: 'power3.inOut',
                onComplete: () => {
                    isProgrammaticScrollRef.current = false;
                },
                onInterrupt: () => {
                    isProgrammaticScrollRef.current = false;
                }
            });
        }
    };

    const navItems = [
        { id: 'home', icon: <HomeIcon />, label: 'Home', onClick: () => scrollToSection('#home', 0) },
        { id: 'about', icon: <AboutIcon />, label: 'About', onClick: () => scrollToSection('#about', 1) },
        { id: 'works', icon: <WorksIcon />, label: 'Works', onClick: () => scrollToSection('#works', 2) },
        { id: 'contact', icon: <ContactIcon />, label: 'Contact', onClick: () => scrollToSection('#contact', 3) }
    ];

    return (
        <main
            className="relative bg-zinc-950 min-h-screen text-zinc-50 font-sans selection:bg-zinc-100 selection:text-zinc-900 overflow-x-hidden"
        >
            {isLoading && (
                <Preloader onComplete={() => setIsLoading(false)} />
            )}

            {/* Floating Navigation Bar */}
            <div 
                className="fixed top-6 left-1/2 z-50 transition-all duration-1000"
                style={{ 
                    opacity: isLoading ? 0 : 1, 
                    transform: isLoading ? 'translate(-50%, -20px)' : 'translate(-50%, 0)',
                    pointerEvents: isLoading ? 'none' : 'auto' 
                }}
            >
                <LimelightNav 
                    activeIndex={activeIndex} 
                    items={navItems}
                />
            </div>

            <div
                id="home-container"
                className={`relative z-10 flex flex-col w-full transition-opacity duration-1000 ${
                    isLoading ? 'opacity-0' : 'opacity-100'
                }`}
                style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
            >
                <Hero isReady={!isLoading} onExplore={() => scrollToSection('#works', 2)} />
                <HorizontalJourney />
                <SystemsBuilt />
                <Footer />
            </div>
        </main>
    );
}
