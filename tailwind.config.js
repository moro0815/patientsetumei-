/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // オフライン運用のため Web フォントは使わず、OS 標準の日本語フォントを優先する
        sans: [
          '"Hiragino Kaku Gothic ProN"',
          '"Hiragino Sans"',
          '"Noto Sans JP"',
          '"BIZ UDPGothic"',
          'Meiryo',
          '"Yu Gothic UI"',
          '"Yu Gothic"',
          'system-ui',
          'sans-serif',
        ],
        serif: ['"Hiragino Mincho ProN"', '"Yu Mincho"', '"Noto Serif JP"', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        // 色覚バリアフリーを意識した配色（赤緑の対比に依存しない）
        ink: {
          DEFAULT: '#1f2933',
          soft: '#3e4c59',
          mute: '#7b8794',
        },
        brand: {
          50: '#eef6fb',
          100: '#d6e9f5',
          200: '#aed3ea',
          300: '#79b6da',
          400: '#4794c4',
          500: '#2a76a8',
          600: '#1f5c86',
          700: '#1b4a6b',
          800: '#173c57',
          900: '#132f43',
        },
        bone: {
          50: '#fdf8f0',
          100: '#f7ecd9',
          200: '#ecd7b4',
          300: '#dcbb85',
          400: '#c79c5c',
          500: '#a97f43',
        },
        alert: {
          50: '#fdf1ec',
          100: '#fbdccf',
          400: '#e8763c',
          500: '#cf5a20',
          600: '#a94517',
        },
        good: {
          50: '#eef7f2',
          100: '#d3ebdd',
          400: '#4aa579',
          500: '#2f855a',
          600: '#256647',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(31,41,51,0.06), 0 8px 24px -12px rgba(31,41,51,0.25)',
      },
    },
  },
  plugins: [],
}
