/** @type {import('tailwindcss').Config} */
import smartisan from './src/tailwind.preset.js'

export default {
  presets: [smartisan],
  content: ['./index.html', './src/**/*.{js,css,html}'],
}
