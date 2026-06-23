'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const SPHERE_MATH = {
  degreesToRadians: (degrees) => degrees * (Math.PI / 180),
  radiansToDegrees: (radians) => radians * (180 / Math.PI),

  sphericalToCartesian: (radius, theta, phi) => ({
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta)
  }),

  calculateDistance: (pos, center = { x: 0, y: 0, z: 0 }) => {
    const dx = pos.x - center.x;
    const dy = pos.y - center.y;
    const dz = pos.z - center.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },

  normalizeAngle: (angle) => {
    while (angle > 180) angle -= 360;
    while (angle < -180) angle += 360;
    return angle;
  }
};

const SphereImageGrid = ({
  images = [],
  containerSize = 400,
  sphereRadius = 200,
  dragSensitivity = 0.5,
  momentumDecay = 0.95,
  maxRotationSpeed = 5,
  baseImageScale = 0.315, // Increased by 1.5x from 0.21
  hoverScale = 1.2,
  perspective = 1000,
  autoRotate = false,
  autoRotateSpeed = 0.3,
  className = ''
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [rotation, setRotation] = useState({ x: 15, y: 15, z: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePositions, setImagePositions] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [dimensions, setDimensions] = useState({
    size: containerSize,
    radius: sphereRadius,
    baseScale: baseImageScale
  });

  const containerRef = useRef(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const touchStartPos = useRef({ x: 0, y: 0 });
  const isHorizontalPan = useRef(null);
  const animationFrame = useRef(null);

  const savedScrollY = useRef(0);

  const isMountedForEffect = useRef(false);

  useEffect(() => {
    // Guard: don't run on initial mount — only run when selectedImage actually changes after mount
    if (!isMountedForEffect.current) {
      isMountedForEffect.current = true;
      return;
    }
    if (typeof window === 'undefined') return;
    if (selectedImage) return; // OPEN is handled synchronously in the click handler

    // CLOSE: capture scroll BEFORE clearing styles, then restore immediately after.
    // This prevents focus-management scroll when the portal unmounts on desktop.
    const scrollBefore = window.scrollY;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.overflow = '';
    // Mobile: return to where the page was before the lock. Desktop: restore current position.
    const targetY = savedScrollY.current > 0 ? savedScrollY.current : scrollBefore;
    window.scrollTo({ top: targetY, behavior: 'instant' });
    savedScrollY.current = 0; // reset so it doesn't bleed into future opens

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
    };
  }, [selectedImage]);

  useEffect(() => {
    const updateSize = () => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        const width = Math.min(window.innerWidth - 32, containerSize);
        const scaleRatio = width / containerSize;
        // Use a fixed mobile baseScale so nodes are always legible, regardless of container ratio
        const mobileBaseScale = 0.40;
        setDimensions({
          size: width,
          radius: width * 0.48,
          baseScale: mobileBaseScale
        });
      } else {
        setDimensions({
          size: containerSize,
          radius: sphereRadius,
          baseScale: baseImageScale
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [containerSize, sphereRadius]);

  const actualContainerSize = dimensions.size;
  const actualSphereRadius = dimensions.radius || actualContainerSize * 0.5;
  const actualBaseScale = dimensions.baseScale || baseImageScale;
  const baseImageSize = actualContainerSize * actualBaseScale;

  const generateSpherePositions = useCallback(() => {
    const positions = [];
    const imageCount = images.length;

    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const angleIncrement = 2 * Math.PI / goldenRatio;

    for (let i = 0; i < imageCount; i++) {
      // Pure Fibonacci sphere distribution for perfectly even coverage
      const t = (i + 0.5) / imageCount;
      const inclination = Math.acos(1 - 2 * t);
      const azimuth = angleIncrement * i;

      let phi = inclination * (180 / Math.PI);
      let theta = (azimuth * (180 / Math.PI)) % 360;

      // Do NOT artificially squash phi to avoid poles, as it creates uneven density
      // Just add a slight random offset to break up perfect grid alignment
      const randomOffset = (Math.random() - 0.5) * 15;
      theta = (theta + randomOffset) % 360;
      phi = Math.max(5, Math.min(175, phi + (Math.random() - 0.5) * 5)); // Keep slightly off exact dead-center poles

      positions.push({
        theta: theta,
        phi: phi,
        radius: actualSphereRadius
      });
    }

    return positions;
  }, [images.length, actualSphereRadius]);

  const calculateWorldPositions = useCallback(() => {
    const positions = imagePositions.map((pos, index) => {
      const thetaRad = SPHERE_MATH.degreesToRadians(pos.theta);
      const phiRad = SPHERE_MATH.degreesToRadians(pos.phi);
      const rotXRad = SPHERE_MATH.degreesToRadians(rotation.x);
      const rotYRad = SPHERE_MATH.degreesToRadians(rotation.y);

      let x = pos.radius * Math.sin(phiRad) * Math.cos(thetaRad);
      let y = pos.radius * Math.cos(phiRad);
      let z = pos.radius * Math.sin(phiRad) * Math.sin(thetaRad);

      const x1 = x * Math.cos(rotYRad) + z * Math.sin(rotYRad);
      const z1 = -x * Math.sin(rotYRad) + z * Math.cos(rotYRad);
      x = x1;
      z = z1;

      const y2 = y * Math.cos(rotXRad) - z * Math.sin(rotXRad);
      const z2 = y * Math.sin(rotXRad) + z * Math.cos(rotXRad);
      y = y2;
      z = z2;

      const worldPos = { x, y, z };

      const fadeZoneStart = -10;
      const fadeZoneEnd = -30;
      const isVisible = worldPos.z > fadeZoneEnd;

      let fadeOpacity = 1;
      if (worldPos.z <= fadeZoneStart) {
        fadeOpacity = Math.max(0, (worldPos.z - fadeZoneEnd) / (fadeZoneStart - fadeZoneEnd));
      }

      const isPoleImage = pos.phi < 30 || pos.phi > 150;

      const distanceFromCenter = Math.sqrt(worldPos.x * worldPos.x + worldPos.y * worldPos.y);
      const maxDistance = actualSphereRadius;
      const distanceRatio = Math.min(distanceFromCenter / maxDistance, 1);

      const distancePenalty = isPoleImage ? 0.4 : 0.7;
      const centerScale = Math.max(0.3, 1 - distanceRatio * distancePenalty);

      const depthScale = (worldPos.z + actualSphereRadius) / (2 * actualSphereRadius);
      const scale = centerScale * Math.max(0.5, 0.8 + depthScale * 0.3);

      return {
        ...worldPos,
        scale,
        zIndex: Math.round(1000 + worldPos.z),
        isVisible,
        fadeOpacity,
        originalIndex: index
      };
    });

    // Return positions directly — Fibonacci distribution gives good spacing without O(n²) collision avoidance per frame
    return positions;
  }, [imagePositions, rotation, actualSphereRadius, baseImageSize]);

  const clampRotationSpeed = useCallback((speed) => {
    return Math.max(-maxRotationSpeed, Math.min(maxRotationSpeed, speed));
  }, [maxRotationSpeed]);

  const updateMomentum = useCallback(() => {
    if (isDragging) return;

    setVelocity(prev => {
      const newVelocity = {
        x: prev.x * momentumDecay,
        y: prev.y * momentumDecay
      };

      if (!autoRotate && Math.abs(newVelocity.x) < 0.01 && Math.abs(newVelocity.y) < 0.01) {
        return { x: 0, y: 0 };
      }

      return newVelocity;
    });

    setRotation(prev => {
      let newY = prev.y;

      if (autoRotate) {
        newY += autoRotateSpeed;
      }

      newY += clampRotationSpeed(velocity.y);

      return {
        x: SPHERE_MATH.normalizeAngle(prev.x + clampRotationSpeed(velocity.x)),
        y: SPHERE_MATH.normalizeAngle(newY),
        z: prev.z
      };
    });
  }, [isDragging, momentumDecay, velocity, clampRotationSpeed, autoRotate, autoRotateSpeed]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    setVelocity({ x: 0, y: 0 });
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;

    const rotationDelta = {
      x: -deltaY * dragSensitivity,
      y: deltaX * dragSensitivity
    };

    setRotation(prev => ({
      x: SPHERE_MATH.normalizeAngle(prev.x + clampRotationSpeed(rotationDelta.x)),
      y: SPHERE_MATH.normalizeAngle(prev.y + clampRotationSpeed(rotationDelta.y)),
      z: prev.z
    }));

    setVelocity({
      x: clampRotationSpeed(rotationDelta.x),
      y: clampRotationSpeed(rotationDelta.y)
    });

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }, [isDragging, dragSensitivity, clampRotationSpeed]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setVelocity({ x: 0, y: 0 });
    lastMousePos.current = { x: touch.clientX, y: touch.clientY };
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    isHorizontalPan.current = null;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;

    const touch = e.touches[0];

    if (isHorizontalPan.current === null) {
      const dx = Math.abs(touch.clientX - touchStartPos.current.x);
      const dy = Math.abs(touch.clientY - touchStartPos.current.y);
      if (dx > 5 || dy > 5) {
        isHorizontalPan.current = dx > dy;
      }
    }

    // Allow native vertical scrolling
    if (isHorizontalPan.current === false) {
      setIsDragging(false);
      return;
    }

    // Only prevent default if we are horizontally swiping (interacting with the 3D grid)
    if (isHorizontalPan.current === true && e.cancelable) {
      e.preventDefault();
    }

    const deltaX = touch.clientX - lastMousePos.current.x;
    const deltaY = touch.clientY - lastMousePos.current.y;

    const rotationDelta = {
      x: -deltaY * dragSensitivity,
      y: deltaX * dragSensitivity
    };

    setRotation(prev => ({
      x: SPHERE_MATH.normalizeAngle(prev.x + clampRotationSpeed(rotationDelta.x)),
      y: SPHERE_MATH.normalizeAngle(prev.y + clampRotationSpeed(rotationDelta.y)),
      z: prev.z
    }));

    setVelocity({
      x: clampRotationSpeed(rotationDelta.x),
      y: clampRotationSpeed(rotationDelta.y)
    });

    lastMousePos.current = { x: touch.clientX, y: touch.clientY };
  }, [isDragging, dragSensitivity, clampRotationSpeed]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // --- Stable ref pattern: keeps effects from re-running every frame ---
  // useCallback deps like `velocity` and `isDragging` change every frame,
  // which would cause animation loop + event listeners to tear down and rebuild at 60fps.
  // Instead we store the latest version in a ref and call it from a stable wrapper.
  const updateMomentumRef = useRef(null);
  updateMomentumRef.current = updateMomentum;

  const handleMouseMoveRef = useRef(null);
  handleMouseMoveRef.current = handleMouseMove;

  const handleMouseUpRef = useRef(null);
  handleMouseUpRef.current = handleMouseUp;

  const handleTouchMoveRef = useRef(null);
  handleTouchMoveRef.current = handleTouchMove;

  const handleTouchEndRef = useRef(null);
  handleTouchEndRef.current = handleTouchEnd;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setImagePositions(generateSpherePositions());
  }, [generateSpherePositions]);

  // Animation loop — stable, never restarts after mount
  useEffect(() => {
    if (!isMounted) return;
    const animate = () => {
      updateMomentumRef.current?.();
      animationFrame.current = requestAnimationFrame(animate);
    };
    animationFrame.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [isMounted]); // no updateMomentum dep — uses ref instead

  // Event listeners — stable, never re-added after mount
  useEffect(() => {
    if (!isMounted) return;
    const onMouseMove = (e) => handleMouseMoveRef.current?.(e);
    const onMouseUp = () => handleMouseUpRef.current?.();
    const onTouchMove = (e) => handleTouchMoveRef.current?.(e);
    const onTouchEnd = () => handleTouchEndRef.current?.();

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [isMounted]); // no handler deps — uses refs instead

  const worldPositions = calculateWorldPositions();

  const renderImageNode = useCallback((image, index) => {
    const position = worldPositions[index];

    if (!position || !position.isVisible) return null;

    const imageSize = baseImageSize * position.scale;
    const isHovered = hoveredIndex === index;
    const finalScale = isHovered ? Math.min(1.2, 1.2 / position.scale) : 1;

    return (
      <div
        key={image.id}
        className="absolute cursor-pointer select-none transition-transform duration-200 ease-out"
        style={{
          width: `${imageSize}px`,
          height: `${imageSize}px`,
          left: `${actualContainerSize / 2 + position.x}px`,
          top: `${actualContainerSize / 2 + position.y}px`,
          opacity: position.fadeOpacity,
          transform: `translate(-50%, -50%) scale(${finalScale})`,
          zIndex: position.zIndex
        }}
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(null)}
        onClick={() => {
          // *** CRITICAL: Lock body scroll SYNCHRONOUSLY before React re-renders ***
          // Safari will jump scroll during the async re-render if we don't lock here first
          if (typeof window !== 'undefined' && window.innerWidth <= 900) {
            const y = window.scrollY;
            savedScrollY.current = y;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${y}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.overflow = 'hidden';
          }
          setSelectedImage(image);
        }}
      >
        <div className="relative w-full h-full rounded-full overflow-hidden shadow-lg">
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-cover"
            draggable={false}
            loading={index < 3 ? 'eager' : 'lazy'}
          />
        </div>
      </div>
    );
  }, [worldPositions, baseImageSize, actualContainerSize, hoveredIndex]);

  const renderSpotlightModal = () => {
    if (!selectedImage || typeof window === 'undefined') return null;

    // Use explicit pixel values from window to bypass any body position:fixed
    // containing block corruption on iOS Safari/Chrome
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const modal = (
      <div
        onClick={() => setSelectedImage(null)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: vw,
          height: vh,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          boxSizing: 'border-box',
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          touchAction: 'none',
          animation: 'fadeIn 0.25s ease-out',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: vw >= 768 ? '580px' : '320px',
            maxHeight: `${vh * 0.85}px`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            animation: 'scaleIn 0.25s ease-out',
          }}
        >
          <div style={{ position: 'relative', width: '100%', flexShrink: 0, aspectRatio: '1/1', borderBottom: '1px solid #f4f4f5' }}>
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.6)',
                border: 'none',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
              }}
            >
              <X size={16} />
            </button>
          </div>

          {(selectedImage.title || selectedImage.description) && (
            <div style={{ padding: '20px', overflowY: 'auto' }}>
              {selectedImage.title && (
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#18181b', lineHeight: 1.3 }}>
                  {selectedImage.title}
                </h3>
              )}
              {selectedImage.description && (
                <p style={{ fontSize: '14px', color: '#71717a', lineHeight: 1.6 }}>
                  {selectedImage.description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );

    return createPortal(modal, document.body);
  };

  if (!isMounted) {
    return (
      <div
        className="bg-gray-100 rounded-full animate-pulse flex items-center justify-center mx-auto"
        style={{ width: actualContainerSize, height: actualContainerSize }}
      >
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!images.length) {
    return (
      <div
        className="bg-gray-50 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto"
        style={{ width: actualContainerSize, height: actualContainerSize }}
      >
        <div className="text-gray-400 text-center">
          <p>No images provided</p>
          <p className="text-sm">Add images to the images prop</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div
        ref={containerRef}
        className={`relative select-none cursor-grab active:cursor-grabbing mx-auto touch-pan-y ${className}`}
        style={{
          width: actualContainerSize,
          height: actualContainerSize,
          perspective: `${perspective}px`
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="relative w-full h-full" style={{ zIndex: 10 }}>
          {images.map((image, index) => renderImageNode(image, index))}
        </div>
      </div>

      {renderSpotlightModal()}
    </>
  );
};

export default SphereImageGrid;
