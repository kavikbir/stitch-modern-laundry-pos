---
name: Azure Clean
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#3f484c'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#6f787d'
  outline-variant: '#bfc8cd'
  surface-tint: '#0c6780'
  primary: '#0c6780'
  on-primary: '#ffffff'
  primary-container: '#87ceeb'
  on-primary-container: '#005870'
  inverse-primary: '#89d0ed'
  secondary: '#4e6073'
  on-secondary: '#ffffff'
  secondary-container: '#cfe2f9'
  on-secondary-container: '#526478'
  tertiary: '#575f65'
  on-tertiary: '#ffffff'
  tertiary-container: '#bdc5cc'
  on-tertiary-container: '#4a5258'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#baeaff'
  primary-fixed-dim: '#89d0ed'
  on-primary-fixed: '#001f29'
  on-primary-fixed-variant: '#004d62'
  secondary-fixed: '#d1e4fb'
  secondary-fixed-dim: '#b5c8df'
  on-secondary-fixed: '#091d2e'
  on-secondary-fixed-variant: '#36485b'
  tertiary-fixed: '#dbe4ea'
  tertiary-fixed-dim: '#bfc8ce'
  on-tertiary-fixed: '#151d22'
  on-tertiary-fixed-variant: '#40484d'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  margin-mobile: 16px
  margin-desktop: 32px
  gutter: 16px
---

## Brand & Style

This design system is built on the philosophy of "Airy Precision." It combines high-end photography with a Minimalist aesthetic to elevate the laundry and delivery experience from a chore to a premium service. The personality is breathable, hyper-organized, and dependable.

The visual style leans into **Minimalism** with subtle **Glassmorphism** accents. By utilizing generous whitespace and a photography-first approach, the UI recedes to let the quality of the garments and the clarity of the service take center stage. The emotional response should be one of immediate relief and trust—a sense of "cleanliness" that extends from the physical service to the digital interface.

## Colors

The palette is anchored by "Soft Sky Blue," a calming, approachable primary hue that replaces traditional aggressive "Action Blues." This is supported by a "Deep Slate" secondary color for high-contrast typography and essential navigation elements.

- **Primary:** Soft Sky (#87CEEB) — used for primary actions, progress indicators, and active states.
- **Secondary:** Deep Slate (#2C3E50) — used for grounding the UI and ensuring readability.
- **Surface:** Light Azure Mist (#F0F8FF) — used for subtle section differentiation and background depth.
- **Background:** Pure White (#FFFFFF) and Neutral Gray (#F9FAFB) — ensures a sterile, fresh environment.

## Typography

The design system uses **Manrope** across all levels to maintain a modern, refined, and balanced feel. The typeface’s geometric yet friendly nature mirrors the efficiency of a POS system with the warmth of a consumer app. 

Headlines use tighter letter spacing and heavier weights to provide clear visual anchors against the expansive whitespace. Body text is set with generous line height to ensure legibility during quick scans of order details or delivery manifests. Labels utilize a slightly increased tracking to maintain clarity at smaller sizes.

## Layout & Spacing

The design system employs a **Fluid Grid** model with a strict 8px rhythmic scale. To achieve the "high-touch" feel, margins are intentionally wider than industry standards to prevent the UI from feeling cluttered.

On mobile, a 4-column grid is used with 16px side margins. On tablet and desktop POS views, a 12-column grid is used. Spacing between major sections (e.g., between an image header and order list) should lean toward the `lg` (40px) or `xl` (64px) units to maintain the premium, airy atmosphere.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** and **Ambient Shadows**. Instead of heavy shadows, this design system utilizes "Cloud Shadows"—extremely diffused, low-opacity (5-8%) blurs with a slight blue tint (#87CEEB) to integrate the elevation with the brand color.

Layering is key: 
- **Level 0 (Base):** Pure White background.
- **Level 1 (Cards):** Subtle 1px border (#F0F8FF) with a soft shadow.
- **Level 2 (Modals/Overlays):** Backdrop blur (12px) with a semi-transparent white fill to create a glass-like effect that keeps the photography visible underneath.

## Shapes

The shape language is defined as **Rounded**, utilizing a 0.5rem (8px) base radius. This creates a soft, approachable feel that avoids the clinical sharpness of square corners or the playfulness of full pill-shapes. Large containers, such as photography cards or order summaries, should use the `rounded-xl` (24px) setting to emphasize the premium nature of the service.

## Components

### Buttons
- **Primary:** Solid Soft Sky Blue with white text. High-contrast, 56px height for touch targets.
- **Secondary:** Ghost style with a 1.5px Soft Sky Blue border and matching text.
- **Tertiary:** Text-only with an icon, used for less critical actions like "View Details."

### Cards
Cards are the primary container for photography. They should feature a "Full Bleed" image at the top with a subtle 12px padding for the text content below. The card border should be nearly invisible, relying on the "Cloud Shadow" for definition.

### Inputs & Fields
Input fields use a light gray fill (#F9FAFB) that transitions to a Soft Sky Blue border on focus. Labels sit outside the field in a bold `label-md` style for maximum clarity during fast-paced POS data entry.

### Chips & Tags
Used for order status (e.g., "In Wash," "Out for Delivery"). These use a low-saturation version of the status color with high-saturation text to maintain the clean aesthetic without overwhelming the user.

### Delivery Tracking
A custom component featuring a vertical or horizontal progress line in Soft Sky Blue, using soft-glow points to indicate completed stages of the laundry cycle.