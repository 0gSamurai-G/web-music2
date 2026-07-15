'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from './ui/AppLogo';
import AdminLoginFlow from './admin/AdminLoginFlow';

export default function SiteFooter() {
    const [clickCount, setClickCount] = useState(0);
    const [showAdmin, setShowAdmin] = useState(false);

    const handleCopyrightClick = () => {
        setClickCount((prev) => {
            const next = prev + 1;
            if (next === 3) {
                setShowAdmin(true);
                return 0;
            }
            return next;
        });
    };

    const handleAnchorClick = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    return (
        <footer
            className="relative z-10 w-full flex items-center"
            style={{
                minHeight: '100vh',
                padding: '60px 24px',
            }}
        >
            <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <AppLogo size={28} />
                    <span
                        className="font-display text-sm font-semibold"
                        style={{ color: 'var(--star-white)' }}
                    >
                        VoidFrequencies
                    </span>
                </div>

                <div className="flex items-center gap-8">
                    <Link
                        href="/"
                        className="font-display text-sm font-medium transition-colors"
                        style={{ color: 'rgba(232,234,255,0.5)' }}
                        onClick={handleAnchorClick}
                    >
                        Home
                    </Link>
                    <Link
                        href="/albums"
                        className="font-display text-sm font-medium transition-colors"
                        style={{ color: 'rgba(232,234,255,0.5)' }}
                        onClick={handleAnchorClick}
                    >
                        Albums
                    </Link>
                    <a
                        href="/"
                        className="font-display text-sm font-medium transition-colors"
                        style={{ color: 'rgba(232,234,255,0.5)' }}
                        onClick={handleAnchorClick}
                    >
                        Privacy
                    </a>
                    <a
                        href="/"
                        className="font-display text-sm font-medium transition-colors"
                        style={{ color: 'rgba(232,234,255,0.5)' }}
                        onClick={handleAnchorClick}
                    >
                        Terms
                    </a>
                </div>

                <div
                    className="font-sans text-sm cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ color: 'rgba(232,234,255,0.3)' }}
                    onClick={handleCopyrightClick}
                    title="Copyright"
                >
                    © 2024 VoidFrequencies
                </div>
            </div>

            {showAdmin && <AdminLoginFlow onClose={() => setShowAdmin(false)} />}
        </footer>
    );
}