"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const morphTime = 1.5;
const holdTime = 4; // 4 seconds hold before morphing

const useMorphingText = (texts) => {
  const textIndexRef = useRef(0);
  const morphRef = useRef(0);
  const cooldownRef = useRef(holdTime);
  const timeRef = useRef(new Date());
  const isMorphingRef = useRef(false);

  const text1Ref = useRef(null);
  const text2Ref = useRef(null);
  const containerRef = useRef(null);

  // Apply correct font based on which text is showing
  const applyFont = useCallback((element, textContent) => {
    if (!element) return;
    const hasTamil = /[\u0B80-\u0BFF]/.test(textContent);
    if (hasTamil) {
      element.style.fontFamily = "'Catamaran', sans-serif";
      element.style.fontWeight = "700";
    } else {
      element.style.fontFamily = "inherit";
      element.style.fontWeight = "inherit";
    }
  }, []);

  const setMorphStyles = useCallback(
    (fraction) => {
      const [current1, current2] = [text1Ref.current, text2Ref.current];
      if (!current1 || !current2 || !texts || texts.length === 0) return;

      // Apply the gooey SVG filter only during the morph to avoid pixelation
      if (containerRef.current) {
        containerRef.current.style.filter = "url(#threshold)";
      }

      const idx1 = textIndexRef.current % texts.length;
      const idx2 = (textIndexRef.current + 1) % texts.length;

      current1.textContent = texts[idx1];
      current2.textContent = texts[idx2];
      applyFont(current1, texts[idx1]);
      applyFont(current2, texts[idx2]);

      current2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      current2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

      const invertedFraction = 1 - fraction;
      current1.style.filter = `blur(${Math.min(8 / invertedFraction - 8, 100)}px)`;
      current1.style.opacity = `${Math.pow(invertedFraction, 0.4) * 100}%`;
    },
    [texts, applyFont]
  );

  const showStatic = useCallback(() => {
    const [current1, current2] = [text1Ref.current, text2Ref.current];
    if (!current1 || !current2 || !texts || texts.length === 0) return;

    // Remove the gooey SVG filter when static to keep text vector-sharp
    if (containerRef.current) {
      containerRef.current.style.filter = "none";
    }

    const idx = textIndexRef.current % texts.length;
    current1.textContent = texts[idx];
    applyFont(current1, texts[idx]);
    current1.style.filter = "none";
    current1.style.opacity = "100%";

    current2.style.filter = "none";
    current2.style.opacity = "0%";
  }, [texts, applyFont]);

  useEffect(() => {
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const newTime = new Date();
      const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000;
      timeRef.current = newTime;

      cooldownRef.current -= dt;

      if (cooldownRef.current <= 0) {
        isMorphingRef.current = true;
        morphRef.current += dt;

        const fraction = morphRef.current / morphTime;

        if (fraction >= 1) {
          textIndexRef.current++;
          morphRef.current = 0;
          cooldownRef.current = holdTime;
          isMorphingRef.current = false;
          showStatic();
        } else {
          setMorphStyles(fraction);
        }
      } else {
        showStatic();
      }
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [setMorphStyles, showStatic]);

  return { text1Ref, text2Ref, containerRef };
};

const SvgFilters = () => (
  <svg
    id="filters"
    style={{ position: 'fixed', width: 0, height: 0, pointerEvents: 'none' }}
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <filter id="threshold">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 255 -140"
        />
      </filter>
    </defs>
  </svg>
);

const MorphingText = ({ texts, className }) => {
  const { text1Ref, text2Ref, containerRef } = useMorphingText(texts);
  
  return (
    <>
      <div
        ref={containerRef}
        className={cn("mx-auto grid text-center leading-[0.85]", className)}
      >
        {/* Invisible structural texts to force grid cell to the maximum required dimensions */}
        <span className="invisible whitespace-pre px-4 col-start-1 row-start-1 select-none pointer-events-none">
          {texts[0]}
        </span>
        <span 
          className="invisible whitespace-pre px-4 col-start-1 row-start-1 select-none pointer-events-none"
          style={{ fontFamily: "'Catamaran', sans-serif", fontWeight: "700" }}
        >
          {texts[1]}
        </span>
        
        {/* Visible animated texts */}
        <span
          className="col-start-1 row-start-1 whitespace-pre self-center"
          ref={text1Ref}
        />
        <span
          className="col-start-1 row-start-1 whitespace-pre self-center"
          ref={text2Ref}
        />
      </div>
      <SvgFilters />
    </>
  );
};

export { MorphingText };
