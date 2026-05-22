/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        card: '#18181b',
        border: '#27272a',
        muted: '#52525b',
        'muted-foreground': '#a1a1aa',
        foreground: '#fafafa',
        primary: '#3b82f6',
        'primary-foreground': '#eff6ff',
        destructive: '#ef4444',
      },
    },
  },
};
