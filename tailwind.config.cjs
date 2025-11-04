/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0D1117',
        'bg-surface': '#0F1420',
        'card': '#111827',
        'border': '#1F2937',
        'text-primary': '#E5E7EB',
        'text-secondary': '#9CA3AF',
        'brand-cyan': '#22D3EE',
        'brand-blue': '#3B82F6',
        'success': '#22C55E',
        'error': '#EF4444',
        'badge-work-bg': '#0E2A3A',
        'badge-work-text': '#22D3EE',
        'badge-personal-bg': '#231a2d',
        'badge-personal-text': '#a78bfa',
        'status-online-bg': '#152a1d',
        'status-online-text': '#22C55E',
        'status-missing-bg': '#2a1f15',
        'status-missing-text': '#f59e0b',
        'status-denied-bg': '#2a1616',
        'status-denied-text': '#EF4444',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(90deg, #22D3EE 0%, #3B82F6 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular'],
      },
      borderRadius: { sm: '8px', md: '12px', lg: '16px', xl: '24px' },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.25)',
        md: '0 8px 24px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}