---
name: Pro-Drive Utility
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#414753'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#727784'
  outline-variant: '#c1c6d5'
  surface-tint: '#005cba'
  primary: '#004e9f'
  on-primary: '#ffffff'
  primary-container: '#0066cc'
  on-primary-container: '#dfe8ff'
  inverse-primary: '#aac7ff'
  secondary: '#5f5e60'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfe1'
  on-secondary-container: '#636264'
  tertiary: '#4e5052'
  on-tertiary: '#ffffff'
  tertiary-container: '#67686a'
  on-tertiary-container: '#e8e8ea'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e3ff'
  primary-fixed-dim: '#aac7ff'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#00458e'
  secondary-fixed: '#e4e2e4'
  secondary-fixed-dim: '#c8c6c8'
  on-secondary-fixed: '#1b1b1d'
  on-secondary-fixed-variant: '#474649'
  tertiary-fixed: '#e2e2e4'
  tertiary-fixed-dim: '#c6c6c8'
  on-tertiary-fixed: '#1a1c1d'
  on-tertiary-fixed-variant: '#454749'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 41px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.03em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.01em
  label-bold:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 13px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  safe-area: 20px
  gutter: 12px
  touch-target-min: 44px
  tile-gap: 1px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style

This design system is engineered for high-stakes, high-speed mobile utility. It targets delivery professionals who require immediate information recognition while in motion or under varying lighting conditions. The brand personality is functional, authoritative, and precise.

The design style is **Minimalist with a Corporate/Modern execution**. It leverages high-contrast canvases and edge-to-edge photography to minimize cognitive load. By stripping away decorative elements, the system ensures that the product and the route remain the primary focus, utilizing a "glass-conduit" approach where the interface serves only to frame the task at hand.

## Colors

The palette is strictly functional. **Action Blue (#0066CC)** is the exclusive color for interactivity, signaling buttons, links, and active states. 

- **Primary Canvas:** #FFFFFF (Light) and #1D1D1F (Dark) provide the high-contrast foundation required for outdoor legibility.
- **Secondary Surface:** #F5F5F7 is used for subtle grouping and background fills behind edge-to-edge tiles.
- **Interactive:** All actionable items must use #0066CC to distinguish them from static data.

## Typography

The typography system uses **Inter** as a functional alternative to SF Pro to maintain the systematic, utilitarian aesthetic. 

- **Headlines:** Use tight negative letter-spacing (-0.02em to -0.04em) to create a dense, editorial impact that mimics professional display type.
- **Body:** Optimized for legibility with standard tracking.
- **Labels:** Small-scale text used for metadata and secondary route information, employing slightly wider tracking for clarity at small sizes.

## Layout & Spacing

This design system utilizes a **No Grid** philosophy centered on edge-to-edge content. Instead of traditional columns, the layout is driven by safe-area margins and vertical stacks.

- **Edge-to-Edge Tiles:** Imagery and route maps should extend to the very edges of the display, separated only by 1px "hairline" dividers or minimal 12px gutters.
- **Touch Targets:** A minimum 44px height is enforced for all interactive zones to accommodate one-handed use and gloved interaction.
- **Visual Rhythm:** Spacing is managed through a base-4 scale, emphasizing vertical density to keep as much information "above the fold" as possible.

## Elevation & Depth

To maintain a high-contrast, "photography-first" appearance, elevation is achieved through **Tonal Layers** and **Low-contrast Outlines** rather than traditional shadows.

- **Surfaces:** Use flat color planes (#FFFFFF and #F5F5F7) to create hierarchy. 
- **Dividers:** 1px borders in #E5E5E7 define the boundaries of edge-to-edge tiles.
- **Scrims:** When text is placed over imagery, a subtle 20-40% black-to-transparent linear gradient is applied to the bottom of the tile to ensure text legibility without obscuring the product photo.

## Shapes

The shape language balances modern approachability with industrial precision. 

- **Tiles & Containers:** Use a 0.5rem (8px) base radius. Large-scale photography tiles use the same radius to maintain a consistent "card-stack" feel.
- **Buttons:** Primary action buttons use a 0.75rem (12px) radius to distinguish them from static content tiles.
- **Media:** Full-bleed images ignore rounding on exterior edges but maintain internal rounding when nested within containers.

## Components

- **Action Buttons:** Large, full-width buttons using #0066CC background with white text. High-contrast, no-shadow, high-gloss finish.
- **Product Tiles:** Edge-to-edge image containers with headline text overlaid on the bottom third using a protective scrim.
- **Route Tiles:** Map-based tiles showing directional vectors in Action Blue. Minimalist markers.
- **Status Chips:** Small, high-contrast badges (e.g., "Urgent," "Delivered") using #1D1D1F backgrounds on light themes to command attention.
- **Input Fields:** Bottom-aligned, high-contrast fields with 16px internal padding. Labels transition to a smaller size when the field is active.
- **Progress Steppers:** Thin 2px lines at the top of the viewport to indicate delivery progress without consuming vertical space.