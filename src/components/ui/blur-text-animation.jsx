"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";

export function BlurTextAnimation({
  text = "Elegant blur animation that brings your words to life with cinematic transitions.",
  words,
  className = "",
  fontSize = "text-lg md:text-xl",
  fontFamily = "font-sans",
  textColor = "text-zinc-600",
  animationDelay = 4000
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef();
  const resetTimeoutRef = useRef();

  const textWords = useMemo(() => {
    if (words) return words;

    const splitWords = text.split(" ");
    const totalWords = splitWords.length;

    return splitWords.map((word, index) => {
      const progress = index / totalWords;

      const exponentialDelay = Math.pow(progress, 0.8) * 0.25;

      const baseDelay = index * 0.03;

      const microVariation = (Math.random() - 0.5) * 0.025;

      return {
        text: word,
        duration: 0.55 + Math.cos(index * 0.3) * 0.15, // Halved for 50% faster speed
        delay: baseDelay + exponentialDelay + microVariation,
        blur: 8 + Math.floor(Math.random() * 4),
        scale: 0.95 + Math.sin(index * 0.2) * 0.05
      };
    });
  }, [text, words]);

  useEffect(() => {
    const startAnimation = () => {
      // Start hidden/blurred then animate in
      setTimeout(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsAnimating(true);
      }, 50);

      // Removed looping logic to ensure text stays visible indefinitely after reveal.
    };

    startAnimation();

    return () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, [textWords, animationDelay]);

  return (
    <div key={text} className={`flex items-center justify-center ${className}`}>
      <div className="text-center max-w-2xl px-4">
        <p className={`${textColor} ${fontSize} ${fontFamily} font-medium leading-relaxed tracking-wide`}>
          {textWords.map((word, index) => (
            <span
              key={index}
              className={`inline-block transition-all ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
              style={{
                transitionDuration: `${word.duration}s`,
                transitionDelay: `${word.delay}s`,
                transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                filter: isAnimating
                  ? 'blur(0px) brightness(1)'
                  : `blur(${word.blur}px) brightness(1.5)`,
                transform: isAnimating
                  ? 'translateY(0) scale(1) rotateX(0deg)'
                  : `translateY(10px) scale(${word.scale || 1}) rotateX(-15deg)`,
                marginRight: '0.25em',
                willChange: 'filter, transform, opacity',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                textShadow: isAnimating
                  ? 'none'
                  : '0 0 20px rgba(0,0,0,0.1)' // Adjusted for light background
              }}
            >
              {word.text}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
