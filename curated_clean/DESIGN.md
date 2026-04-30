---
name: Curated Clean
colors:
  surface: '#f9f9ff'
  surface-dim: '#d8d9e2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3fc'
  surface-container: '#ecedf6'
  surface-container-high: '#e6e8f1'
  surface-container-highest: '#e1e2eb'
  on-surface: '#191c22'
  on-surface-variant: '#414753'
  inverse-surface: '#2e3037'
  inverse-on-surface: '#eff0f9'
  outline: '#727784'
  outline-variant: '#c1c6d5'
  surface-tint: '#005cba'
  primary: '#004e9f'
  on-primary: '#ffffff'
  primary-container: '#0066cc'
  on-primary-container: '#dfe8ff'
  inverse-primary: '#aac7ff'
  secondary: '#495f87'
  on-secondary: '#ffffff'
  secondary-container: '#b9cffd'
  on-secondary-container: '#425880'
  tertiary: '#883700'
  on-tertiary: '#ffffff'
  tertiary-container: '#af4900'
  on-tertiary-container: '#ffe3d6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e3ff'
  primary-fixed-dim: '#aac7ff'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#00458e'
  secondary-fixed: '#d7e3ff'
  secondary-fixed-dim: '#b0c7f5'
  on-secondary-fixed: '#001b3e'
  on-secondary-fixed-variant: '#30476d'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb692'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#793000'
  background: '#f9f9ff'
  on-background: '#191c22'
  surface-variant: '#e1e2eb'
typography:
  display-hero:
    fontFamily: SF Pro Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: SF Pro Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: SF Pro Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: SF Pro Text
    fontSize: 17px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: -0.01em
  body-sm:
    fontFamily: SF Pro Text
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: '0'
  label-caps:
    fontFamily: SF Pro Display
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  edge-margin: 40px
  gutter: 24px
  tile-padding: 32px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
This design system treats laundry services as high-end artifacts within a museum gallery. The brand personality is quiet, authoritative, and obsessively clean. It rejects the typical "utility" aesthetic of POS systems in favor of an editorial, photography-first experience. 

The style is a disciplined blend of **Minimalism** and **High-Contrast Editorial**. By alternating light and dark canvases, the UI creates a rhythmic, cinematic flow that guides the eye through service selections. Every interface element is designed to recede into the "white cube" of the gallery, ensuring that the texture of linens and the crispness of folded garments remain the focal point.

## Colors
The palette is architectural and restrained. **Canvas** and **Parchment** provide the foundational surfaces for light-themed service tiles, while **Dark Tile** offers a sophisticated counterpoint for high-contrast sections. **Ink** is used exclusively for precise typography and structural lines.

A single interactive color, **Action Blue**, is used to denote utility, selection, and progression. This color must be used sparingly to maintain its functional semiotics; it is the "laser pointer" in the gallery, highlighting what matters without distracting from the exhibits.

## Typography
The typography strategy mimics high-fashion mastheads. **SF Pro Display** is used for all headlines with tight tracking and heavy weights to create a sense of impact and "ink-on-paper" density. **SF Pro Text** handles all functional and descriptive content at a highly readable 17px base.

*Note: In implementation, "Inter" serves as the closest web-safe alternative to the system fonts requested, but SF Pro remains the intended typeface for Apple-environment deployments.*

## Layout & Spacing
The layout follows a **fluid grid** with generous edge margins, ensuring the "gallery" has room to breathe. Service tiles are edge-to-edge in their containers, alternating background colors to create a distinct visual cadence.

Spacing is used to group information without the need for borders or lines. Vertical stacks should be generous; allow for significant negative space between the headline and the body text to emphasize the museum-like curation.

## Elevation & Depth
This system eschews traditional UI depth. There are no shadows on buttons, navigation bars, or cards. The interface is intentionally flat to emphasize the "chrome recedes" philosophy.

The sole exception is the **Signature Drop-Shadow**. This is a soft, diffused ambient shadow applied only to product imagery (e.g., a pile of towels or a folded shirt) that appears to rest directly on the tile surface. This grounds the photography and gives it a tactile, three-dimensional quality within a two-dimensional interface.

## Shapes
The shape language is varied to create a clear hierarchy of interaction. **Full Pill** shapes are reserved exclusively for primary actions and "Add to Cart" functions. **18px (lg)** corners are used for the main service tiles and gallery cards, providing a soft but structured frame for photography. **8px (sm)** corners are used for utility elements like quantity increments and secondary filters.

## Components

### Service Tiles
The core component of the system. These are large-format cards with an 18px radius. They must alternate between #ffffff and #272729 backgrounds. Photography within these tiles should be center-aligned or elegantly offset, featuring the signature shadow.

### Buttons
- **Primary:** Full pill-shaped, #0066cc background with white text. High-contrast, no shadow.
- **Utility:** 8px radius, #f5f5f7 background with #1d1d1f text. Used for secondary adjustments.

### Input Fields & Selectors
Inputs are minimalist, utilizing #f5f5f7 surfaces with no borders. Focus states are indicated by a 2px #0066cc inner stroke. 

### Progress Indicators
A thin 2px #0066cc line at the very top of the viewport. No heavy headers or breadcrumbs; navigation should feel like moving from one room to another in a gallery.

### Imagery
All photography must be shot on neutral, high-key backgrounds that blend into the #ffffff or #f5f5f7 canvas. Objects should appear as if they are physical items placed on the screen.