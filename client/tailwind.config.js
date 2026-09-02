/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:           '#F3F1EC',
        surface:      '#FAFAF8',
        card:         '#FFFFFF',
        ink:          '#18181A',
        sub:          '#686560',
        muted:        '#9E9A93',
        line:         '#E6E2D8',
        accent:       '#C0102A',
        'accent-dim': '#F6DDE1',
        'accent-mid': '#E8354D',
        ok:           '#2A6348',
        'ok-bg':      '#E3F0EA',
        warn:         '#B45309',
        'warn-bg':    '#FEF3C7'
      },
      fontFamily: {
        tajawal: ['Tajawal', 'sans-serif'],
        body: ['Tajawal', 'sans-serif']
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem'
      },
      boxShadow: {
        card:   '0 1px 3px 0 rgba(24,24,26,0.06), 0 1px 2px -1px rgba(24,24,26,0.04)',
        lifted: '0 4px 12px -2px rgba(24,24,26,0.08), 0 2px 6px -2px rgba(24,24,26,0.05)',
        glow:   '0 0 0 3px rgba(192,16,42,0.12)',
        modal:  '0 20px 60px -8px rgba(24,24,26,0.22), 0 8px 20px -4px rgba(24,24,26,0.1)'
      },
      animation: {
        'fade-in':     'fadeIn 0.2s ease-out',
        'slide-up':    'slideUp 0.25s cubic-bezier(0.16,1,0.3,1)',
        'slide-down':  'slideDown 0.2s ease-out',
        'scale-in':    'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)',
        'pulse-soft':  'pulseSoft 2.4s ease-in-out infinite'
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.65' } }
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
};
