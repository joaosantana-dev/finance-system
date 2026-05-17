import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        body:    { value: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
        heading: { value: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
      },
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
      radii: {
        xl:  { value: '12px' },
        '2xl': { value: '16px' },
      },
    },
    semanticTokens: {
      colors: {
        'sidebar.bg': {
          value: { _light: '#111827', _dark: '#080d14' },
        },
        'sidebar.text': {
          value: { _light: '#9ca3af', _dark: '#6b7280' },
        },
        'sidebar.active': {
          value: { _light: '#3b82f6', _dark: '#2563eb' },
        },
        'navbar.bg': {
          value: { _light: 'rgba(255,255,255,0.85)', _dark: 'rgba(17,24,39,0.9)' },
        },
        'page.bg': {
          value: { _light: '#f1f5f9', _dark: '#0d1117' },
        },
        'card.bg': {
          value: { _light: 'white', _dark: '#161b22' },
        },
        'card.border': {
          value: { _light: '#e2e8f0', _dark: 'rgba(255,255,255,0.06)' },
        },
        'table.header': {
          value: { _light: '#f8fafc', _dark: '#1a2236' },
        },
        'table.border': {
          value: { _light: '#f1f5f9', _dark: 'rgba(255,255,255,0.05)' },
        },
        'table.row.hover': {
          value: { _light: '#f8fafc', _dark: 'rgba(255,255,255,0.03)' },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
