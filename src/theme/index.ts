import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50:  { value: '#eff6ff' },
          100: { value: '#dbeafe' },
          200: { value: '#bfdbfe' },
          300: { value: '#93c5fd' },
          400: { value: '#60a5fa' },
          500: { value: '#3b82f6' },
          600: { value: '#2563eb' },
          700: { value: '#1d4ed8' },
          800: { value: '#1e40af' },
          900: { value: '#1e3a8a' },
        },
      },
    },
    semanticTokens: {
      colors: {
        'sidebar.bg': {
          value: { _light: '#0f1624', _dark: '#080d14' },
        },
        'sidebar.text': {
          value: { _light: '#94a3b8', _dark: '#64748b' },
        },
        'sidebar.active': {
          value: { _light: '#3b82f6', _dark: '#2563eb' },
        },
        'navbar.bg': {
          value: { _light: 'white', _dark: '#111827' },
        },
        'page.bg': {
          value: { _light: '#f8fafc', _dark: '#0d1117' },
        },
        'card.bg': {
          value: { _light: 'white', _dark: '#161b22' },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
