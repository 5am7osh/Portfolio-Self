"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function InteractiveProductCard({
  className,
  imageUrl,
  logoUrl,
  title,
  description,
  price,
  ...props
}) {
  const cardRef = React.useRef(null);
  const [style, setStyle] = React.useState({});

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    const rotateX = (y - height / 2) / (height / 2) * -8;
    const rotateY = (x - width / 2) / (width / 2) * 8;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`,
      transition: "transform 0.1s ease-out",
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.4s ease-in-out",
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ ...style, transformStyle: "preserve-3d" }}
      className={cn(
        "relative w-full max-w-[800px] rounded-3xl bg-black shadow-lg overflow-hidden group",
        className
      )}
      {...props}
    >
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-auto rounded-3xl transition-transform duration-300"
        style={{ transform: "translateZ(0)" }}
      />
    </div>
  );
}
