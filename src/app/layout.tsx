import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, DM_Sans } from 'next/font/google';
import '../styles/tailwind.css';

const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-space-grotesk',
    display: 'swap',
});

const dmSans = DM_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-dm-sans',
    display: 'swap',
});

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
};

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: 'VoidFrequencies — Anime Music Artist',
    description: 'VoidFrequencies is an anime music artist crafting deep space noir soundscapes across 5 albums. Explore the cinematic journey from free fall to triumph.',
    icons: {
        icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
    },
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
            <body className={dmSans.className}>
                {children}

                <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fvoidfreque3580back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.19" />
                <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" /></body>
        </html>
    );
}