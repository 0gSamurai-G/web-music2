'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const labelRef = useRef<HTMLSpanElement>(null);
    const posRef = useRef({ x: 0, y: 0 });
    const ringPosRef = useRef({ x: 0, y: 0 });
    const rafRef = useRef<number>(0);
    const [cursorState, setCursorState] = useState<'default' | 'hover' | 'album'>('default');
    const [label, setLabel] = useState('');

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            posRef.current = { x: e.clientX, y: e.clientY };

            if (dotRef.current) {
                dotRef.current.style.left = `${e.clientX}px`;
                dotRef.current.style.top = `${e.clientY}px`;
            }
        };

        const lerp = () => {
            if (document.visibilityState === 'hidden') {
                rafRef.current = requestAnimationFrame(lerp);
                return;
            }

            ringPosRef.current.x += (posRef.current.x - ringPosRef.current.x) * 0.12;
            ringPosRef.current.y += (posRef.current.y - ringPosRef.current.y) * 0.12;

            if (ringRef.current) {
                ringRef.current.style.left = `${ringPosRef.current.x}px`;
                ringRef.current.style.top = `${ringPosRef.current.y}px`;
            }

            rafRef.current = requestAnimationFrame(lerp);
        };

        rafRef.current = requestAnimationFrame(lerp);

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isAlbum = target.closest('[data-cursor="album"]');
            const isInteractive = target.closest('a, button, [data-cursor="hover"]');

            if (isAlbum) {
                setCursorState('album');
                setLabel(target.closest('[data-cursor-label]')?.getAttribute('data-cursor-label') || 'Open');
            } else if (isInteractive) {
                setCursorState('hover');
                setLabel(target.closest('[data-cursor-label]')?.getAttribute('data-cursor-label') || 'View');
            } else {
                setCursorState('default');
                setLabel('');
            }
        };

        window.addEventListener('mousemove', handleMove, { passive: true });
        window.addEventListener('mouseover', handleMouseOver, { passive: true });

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    return (
        <>
            <div ref={dotRef} className="custom-cursor-dot" style={{ opacity: cursorState !== 'default' ? 0 : 1 }} />
            <div
                ref={ringRef}
                className={`custom-cursor-ring ${cursorState === 'hover' ? 'hovered' : ''} ${cursorState === 'album' ? 'album-hovered' : ''}`}
            >
                <span ref={labelRef} className="cursor-label">{label}</span>
            </div>
        </>
    );
}