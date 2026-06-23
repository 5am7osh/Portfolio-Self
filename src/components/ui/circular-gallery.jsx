'use client';
import React, { useState, useEffect, useRef } from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const CircularGallery = React.forwardRef(
  ({ items, className, radius = 600, autoRotateSpeed = 0.02, onItemHover, onMouseLeave, ...props }, ref) => {
    const rotationRef = useRef(0);
    const wrapperRef = useRef(null);
    const itemNodesRef = useRef([]);
    const [isScrolling, setIsScrolling] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [containerWidth, setContainerWidth] = useState(800);
    const containerRef = useRef(null);
    const scrollTimeoutRef = useRef(null);
    const animationFrameRef = useRef(null);
    const dragStartX = useRef(0);
    const dragStartRotation = useRef(0);
    
    const updateDOM = React.useCallback(() => {
      if (!wrapperRef.current || !items.length) return;
      
      const anglePerItem = 360 / items.length;
      wrapperRef.current.style.transform = `rotateY(${rotationRef.current}deg)`;
      
      const totalRotation = rotationRef.current % 360;
      items.forEach((_, i) => {
        const el = itemNodesRef.current[i];
        if (!el) return;
        
        const itemAngle = i * anglePerItem;
        const relativeAngle = (itemAngle + totalRotation + 360) % 360;
        const normalizedAngle = Math.abs(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle);
        const opacity = Math.max(0.85, 1 - (normalizedAngle / 180) * 0.15);
        
        el.style.opacity = opacity;
      });
    }, [items]);

    // Measure container for responsive sizing
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const ro = new ResizeObserver(([entry]) => {
        setContainerWidth(entry.contentRect.width);
      });
      ro.observe(el);
      setContainerWidth(el.offsetWidth);
      return () => ro.disconnect();
    }, []);

    // Scroll-based rotation
    useEffect(() => {
      const handleScroll = () => {
        setIsScrolling(true);
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
        rotationRef.current = scrollProgress * 360;
        updateDOM();
        scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 150);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      };
    }, [updateDOM]);

    // Auto-rotation
    useEffect(() => {
      const autoRotate = () => {
        if (!isScrolling && !isDragging) {
          rotationRef.current -= autoRotateSpeed;
          updateDOM();
        }
        animationFrameRef.current = requestAnimationFrame(autoRotate);
      };
      animationFrameRef.current = requestAnimationFrame(autoRotate);
      return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };
    }, [isScrolling, isDragging, autoRotateSpeed]);

    const handlePointerDown = (e) => {
      setIsDragging(true);
      dragStartX.current = e.clientX;
      dragStartRotation.current = rotationRef.current;
      e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartX.current;
      rotationRef.current = dragStartRotation.current + deltaX * 0.1;
      updateDOM();
    };

    const handlePointerUp = (e) => {
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    };

    // Responsive values — all derived from measured container width
    const isMobile = containerWidth < 768;
    const cardW = isMobile ? Math.min(containerWidth * 0.78, 320) : 800;
    const cardH = isMobile ? Math.round(cardW * 0.62) : 480;
    const effectiveRadius = isMobile ? containerWidth * 0.5 : radius;
    const anglePerItem = 360 / items.length;

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        role="region"
        aria-label="Circular 3D Gallery"
        className={cn(
          'relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing',
          className
        )}
        style={{
          perspective: isMobile ? '600px' : '2000px',
          // Allow vertical scroll on mobile, lock on desktop for drag
          touchAction: isMobile ? 'pan-y' : 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        {...props}
      >
        <div
          ref={wrapperRef}
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {items.map((item, i) => {
            const itemAngle = i * anglePerItem;
            return (
              <div
                key={item.id}
                ref={el => itemNodesRef.current[i] = el}
                role="group"
                aria-label={item.description}
                className="absolute"
                style={{
                  width: `${cardW}px`,
                  height: `${cardH}px`,
                  transform: `rotateY(${itemAngle}deg) translateZ(${effectiveRadius}px) scale(0.5)`,
                  left: '50%',
                  top: '50%',
                  marginLeft: `-${cardW / 2}px`,
                  marginTop: `-${cardH / 2}px`,
                  transition: 'opacity 0.3s linear',
                  willChange: 'transform, opacity',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
                onMouseEnter={() => onItemHover?.(item)}
                onMouseLeave={() => onMouseLeave?.()}
              >
                <div className="relative w-full h-full rounded-2xl shadow-2xl overflow-hidden group">
                  <img
                    src={encodeURI(item.image)}
                    alt={item.description}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ objectPosition: 'center' }}
                    draggable={false}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

CircularGallery.displayName = 'CircularGallery';
export { CircularGallery };
