"use client";

import React, { useRef, useEffect } from 'react';

export default function InfiniteScrollGallery({ images }) {
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const currentTranslate = useRef(0);
  const prevTranslate = useRef(0);
  const animationRef = useRef(null);
  const loopWidth = useRef(0);

  const originalCount = images.length;
  // Duplicate enough times to fill super-wide screens safely
  const duplicatedImages = Array(8).fill(images).flat();

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const items = container.children;
    if (items.length <= originalCount) return;

    // Calculate exact width of one logical loop to avoid gap-stutter
    const calculateLoopWidth = () => {
      const firstItem = items[0];
      const loopItem = items[originalCount];
      loopWidth.current = loopItem.getBoundingClientRect().left - firstItem.getBoundingClientRect().left;
    };
    
    // Small delay to ensure images are laid out before calculating
    setTimeout(calculateLoopWidth, 100);
    window.addEventListener('resize', calculateLoopWidth);

    const animate = () => {
      if (!isDragging.current) {
        currentTranslate.current -= 1.5; // Auto-scroll speed
        
        // Wrap logic for auto-scroll
        if (currentTranslate.current <= -loopWidth.current) {
           currentTranslate.current += loopWidth.current;
        } else if (currentTranslate.current > 0) {
           currentTranslate.current -= loopWidth.current;
        }
      }
      container.style.transform = `translateX(${currentTranslate.current}px)`;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', calculateLoopWidth);
    };
  }, [originalCount]);

  const handlePointerDown = (e) => {
    isDragging.current = true;
    startX.current = e.clientX;
    prevTranslate.current = currentTranslate.current;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grabbing';
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const delta = e.clientX - startX.current;
    currentTranslate.current = prevTranslate.current + delta;
    
    // Wrap logic while dragging
    if (currentTranslate.current <= -loopWidth.current) {
       currentTranslate.current += loopWidth.current;
       prevTranslate.current += loopWidth.current;
    } else if (currentTranslate.current > 0) {
       currentTranslate.current -= loopWidth.current;
       prevTranslate.current -= loopWidth.current;
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
  };

  return (
    <>
      <style>{`
        .scroll-container-mask {
          mask: linear-gradient(90deg, transparent 0%, black 1%, black 99%, transparent 100%);
          -webkit-mask: linear-gradient(90deg, transparent 0%, black 1%, black 99%, transparent 100%);
        }
      `}</style>
      
      <div className="w-full relative overflow-hidden flex items-center justify-center select-none">
        <div className="relative z-10 w-full flex items-center justify-center py-8">
          <div className="scroll-container-mask w-full max-w-[1600px] px-4 md:px-8 overflow-hidden touch-none">
            <div 
              ref={scrollRef}
              className="flex gap-6 w-max cursor-grab"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {duplicatedImages.map((image, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 h-64 md:h-80 lg:h-[450px] rounded-2xl shadow-2xl pointer-events-none"
                >
                  <img
                    src={image}
                    alt={`Gallery image ${(index % originalCount) + 1}`}
                    className="w-auto h-full object-contain rounded-2xl pointer-events-none"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
