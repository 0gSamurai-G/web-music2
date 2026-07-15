/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
    darkMode: 'class',
    theme: {
        container: {
            center: true,
            padding: '1rem',
        },
        extend: {
            colors: {
                background: { DEFAULT: 'var(--background)' },
                foreground: { DEFAULT: 'var(--foreground)' },
                primary: {
                    DEFAULT: 'var(--primary)',
                    foreground: 'var(--primary-foreground)',
                },
                secondary: {
                    DEFAULT: 'var(--secondary)',
                    foreground: 'var(--secondary-foreground)',
                },
                accent: {
                    DEFAULT: 'var(--accent)',
                    foreground: 'var(--accent-foreground)',
                },
                muted: {
                    DEFAULT: 'var(--muted)',
                    foreground: 'var(--muted-foreground)',
                },
                card: {
                    DEFAULT: 'var(--card)',
                    foreground: 'var(--card-foreground)',
                },
                border: { DEFAULT: 'var(--border)' },
                input: { DEFAULT: 'var(--input)' },
                ring: { DEFAULT: 'var(--ring)' },
                'void-black': { DEFAULT: 'var(--void-black)' },
                'star-white': { DEFAULT: 'var(--star-white)' },
                'ice-blue': { DEFAULT: 'var(--ice-blue)' },
                'cosmos-purple': { DEFAULT: 'var(--cosmos-purple)' },
                'galaxy-gold': { DEFAULT: 'var(--galaxy-gold)' },
            },
            borderRadius: {
                DEFAULT: 'var(--radius)',
                sm: 'calc(var(--radius) - 4px)',
                lg: 'calc(var(--radius) + 4px)',
                xl: 'calc(var(--radius) + 8px)',
            },
            fontFamily: {
                sans: ['var(--font-dm-sans)', 'sans-serif'],
                display: ['var(--font-space-grotesk)', 'sans-serif'],
            },
        },
    },
    plugins: [require('@tailwindcss/typography')],
};