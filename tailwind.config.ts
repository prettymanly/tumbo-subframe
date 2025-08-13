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
      fontFamily: { ...themeTokens.fontFamily },
      boxShadow: { ...themeTokens.shadows },
      borderRadius: { ...themeTokens.radii },
    },
  },
  plugins: [],
}

export default config
