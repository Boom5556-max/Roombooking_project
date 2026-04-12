/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Anuphan', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // เลื่อนขึ้น 1 ระดับ: เฉพาะ font เท่านั้น (spacing/padding/margin ไม่เปลี่ยน)
        'xs':   ['0.875rem', { lineHeight: '1.25rem' }],    // 14px  (เดิม 12px)
        'sm':   ['1rem',     { lineHeight: '1.5rem' }],     // 16px  (เดิม 14px)
        'base': ['1.125rem', { lineHeight: '1.75rem' }],    // 18px  (เดิม 16px)
        'lg':   ['1.25rem',  { lineHeight: '1.75rem' }],    // 20px  (เดิม 18px)
        'xl':   ['1.5rem',   { lineHeight: '2rem' }],       // 24px  (เดิม 20px)
        '2xl':  ['1.875rem', { lineHeight: '2.25rem' }],    // 30px  (เดิม 24px)
        '3xl':  ['2.25rem',  { lineHeight: '2.5rem' }],     // 36px  (เดิม 30px)
        '4xl':  ['3rem',     { lineHeight: '1.2' }],        // 48px  (เดิม 36px)
        '5xl':  ['3.75rem',  { lineHeight: '1' }],          // 60px  (เดิม 48px)
        '6xl':  ['4.5rem',   { lineHeight: '1' }],          // 72px  (เดิม 60px)
      },
      colors: {
        status: {
          green: '#10B981',
          red: '#EF4444',
          orange: '#F59E0B',
          blue: '#0EA5E9',
        }
      }
    },
  },
  plugins: [],
}