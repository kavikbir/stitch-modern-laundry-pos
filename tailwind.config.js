/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.html"
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'gradient-x': 'gradient-x 3s ease infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      "colors": {
        "on-tertiary-fixed-variant": "#793000",
        "surface-variant": "#e1e2eb",
        "on-error-container": "#93000a",
        "outline-variant": "#c1c6d5",
        "primary-fixed-dim": "#aac7ff",
        "inverse-on-surface": "#eff0f9",
        "surface-dim": "#d8d9e2",
        "on-background": "#191c22",
        "outline": "#727784",
        "on-surface-variant": "#414753",
        "on-tertiary": "#ffffff",
        "on-error": "#ffffff",
        "tertiary-fixed": "#ffdbcb",
        "on-primary-fixed": "#001b3e",
        "on-primary": "#ffffff",
        "background": "#f9f9ff",
        "on-secondary-fixed-variant": "#30476d",
        "surface-bright": "#f9f9ff",
        "primary-fixed": "#d7e3ff",
        "surface": "#f9f9ff",
        "on-secondary-fixed": "#001b3e",
        "on-primary-fixed-variant": "#00458e",
        "tertiary-fixed-dim": "#ffb692",
        "primary-container": "#0066cc",
        "surface-container-low": "#f2f3fc",
        "tertiary-container": "#af4900",
        "surface-container": "#ecedf6",
        "on-tertiary-container": "#ffe3d6",
        "secondary-fixed-dim": "#b0c7f5",
        "secondary-fixed": "#d7e3ff",
        "secondary-container": "#b9cffd",
        "surface-tint": "#005cba",
        "error": "#ba1a1a",
        "on-tertiary-fixed": "#341100",
        "surface-container-high": "#e6e8f1",
        "on-secondary-container": "#425880",
        "inverse-primary": "#aac7ff",
        "primary": "#004e9f",
        "tertiary": "#883700",
        "surface-container-highest": "#e1e2eb",
        "surface-container-lowest": "#ffffff",
        "inverse-surface": "#2e3037",
        "on-surface": "#191c22",
        "on-secondary": "#ffffff",
        "on-primary-container": "#dfe8ff",
        "secondary": "#495f87",
        "error-container": "#ffdad6"
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      "spacing": {
        "stack-sm": "8px",
        "edge-margin": "40px",
        "tile-padding": "32px",
        "stack-md": "16px",
        "stack-lg": "32px",
        "unit": "4px",
        "gutter": "24px"
      },
      "fontFamily": {
        "body-sm": ["SF Pro Text", "system-ui", "-apple-system", "sans-serif"],
        "body-lg": ["SF Pro Text", "system-ui", "-apple-system", "sans-serif"],
        "display-hero": ["SF Pro Display", "system-ui", "-apple-system", "sans-serif"],
        "headline-lg": ["SF Pro Display", "system-ui", "-apple-system", "sans-serif"],
        "label-caps": ["SF Pro Display", "system-ui", "-apple-system", "sans-serif"],
        "headline-md": ["SF Pro Display", "system-ui", "-apple-system", "sans-serif"]
      },
      "fontSize": {
        "body-sm": ["14px", {"lineHeight": "1.4", "letterSpacing": "0", "fontWeight": "400"}],
        "body-lg": ["17px", {"lineHeight": "1.5", "letterSpacing": "-0.01em", "fontWeight": "400"}],
        "display-hero": ["48px", {"lineHeight": "1.1", "letterSpacing": "-0.03em", "fontWeight": "600"}],
        "headline-lg": ["32px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "600"}],
        "label-caps": ["12px", {"lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "600"}],
        "headline-md": ["24px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "600"}]
      }
    },
  },
  plugins: [],
}
