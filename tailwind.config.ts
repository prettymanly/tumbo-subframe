import type { Config } from 'tailwindcss'
import themeTokens from './src/theme/tokens'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/subframe/ui/**/*.{tsx,ts,js,jsx}', // added by Subframe
  ],
  presets: [
    require("./src/components/subframe/ui/tailwind.config.js"), // added by Subframe
  ],
  theme: {
    extend: {
      colors: {
        ...themeTokens.colors.flat,
        brand: { ...themeTokens.colors.brand },
        neutral: { ...themeTokens.colors.neutral } as any,
        error: { ...themeTokens.colors.error },
        warning: { ...themeTokens.colors.warning },
        success: { ...themeTokens.colors.success },
      },
      fontFamily: {
        caption: ["var(--font-lexend)", "system-ui", "sans-serif"],
        'caption-bold': ["var(--font-lexend)", "system-ui", "sans-serif"],
        body: ["var(--font-lexend)", "system-ui", "sans-serif"],
        'body-bold': ["var(--font-lexend)", "system-ui", "sans-serif"],
        'heading-3': ["var(--font-lexend)", "system-ui", "sans-serif"],
        'heading-2': ["var(--font-lexend)", "system-ui", "sans-serif"],
        'heading-1': ["var(--font-lexend)", "system-ui", "sans-serif"],
        'monospace-body': ["var(--font-plex-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: { ...themeTokens.shadows },
      borderRadius: { ...themeTokens.radii },
      sidebar: {
        DEFAULT: 'hsl(var(--sidebar-background))',
        foreground: 'hsl(var(--sidebar-foreground))',
        primary: 'hsl(var(--sidebar-primary))',
        'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
        accent: 'hsl(var(--sidebar-accent))',
        'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
        border: 'hsl(var(--sidebar-border))',
        ring: 'hsl(var(--sidebar-ring))',
      },
    },
  },
  plugins: [],
}

export default config
