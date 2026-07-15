'use client';

import React, { useEffect, useRef } from 'react';

interface CosmicBackgroundProps {
  isVisible: boolean;
}

export default function CosmicBackground({ isVisible }: CosmicBackgroundProps) {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = bgRef.current;
    if (!element) return;

    element.style.animationPlayState = isVisible ? 'running' : 'paused';
    element.style.opacity = isVisible ? '1' : '0';
  }, [isVisible]);

  return (
    <div
      ref={bgRef}
      className="cosmic-background"
      aria-hidden="true"
      style={{
        animationPlayState: isVisible ? 'running' : 'paused',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.8s ease',
      }}
    />
  );
}
