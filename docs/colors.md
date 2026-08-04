# Color Palette

This document defines the visual color palette used across the **MyMemories** frontend.

The overall design is inspired by **old travel journals, vintage postcard albums, aged paper, and handwritten notebooks**. The goal is to create a warm and nostalgic interface while maintaining a clean, modern user experience.

---

# Design Principles

- Warm and natural colors.
- Paper-inspired backgrounds.
- Low saturation.
- High readability.
- Images should always remain the visual focus.
- UI colors should support the content, never compete with it.

---

# Core Palette

| Role | Name | Hex |
|------|------|------|
| Background | Old Paper | `#FFEABB` |
| Surface | Ivory | `#FFF6E3` |
| Surface Hover | Light Cream | `#FFF0D0` |
| Border | Aged Paper | `#D8C59B` |
| Primary Text | Dark Ink | `#3C3128` |
| Secondary Text | Faded Ink | `#75675A` |

---

# Accent Colors

| Purpose | Name | Hex |
|----------|------|------|
| Primary | Vintage Blue | `#4C6A92` |
| Success | Forest Green | `#617A55` |
| Accent | Antique Gold | `#C89B3C` |
| Warning | Burnt Orange | `#C46A3A` |
| Error | Burgundy | `#8A3C3C` |

---

# Neutral Scale

| Shade | Hex |
|--------|------|
| 50 | `#FFFDF8` |
| 100 | `#FFF8EC` |
| 200 | `#FFEABB` |
| 300 | `#F2DCAB` |
| 400 | `#D8C59B` |
| 500 | `#B7A57E` |
| 600 | `#8D7C5B` |
| 700 | `#6B5A41` |
| 800 | `#4D4030` |
| 900 | `#31271D` |

---

# Component Guidelines

## Background

- Color: `#FFEABB`
- Represents aged paper.
- Used as the primary application background.

## Cards

- Background: `#FFF6E3`
- Border: `#D8C59B`
- Rounded corners.
- Soft shadow only.

Cards should resemble pieces of paper placed on top of the album page.

---

## Primary Buttons

Background:

`#4C6A92`

Hover:

`#3F5B80`

Text:

`#FFFFFF`

---

## Secondary Buttons

Background:

`#FFF6E3`

Border:

`#D8C59B`

Text:

`#3C3128`

---

## Text

Primary:

`#3C3128`

Secondary:

`#75675A`

Disabled:

`#B7A57E`

---

## Borders

Default:

`#D8C59B`

Hover:

`#B7A57E`

Borders should remain subtle and never dominate the interface.

---

# Gallery

Postcard thumbnails are the primary visual element.

The interface should never use large colored backgrounds behind images.

Country identification should rely on:

- Country flag
- Country name

rather than assigning arbitrary colors to countries.

---

# Map

Future map view:

| Element | Color |
|----------|------|
| Ocean | `#F7F3EA` |
| Land | `#E8D6B5` |
| Markers | `#4C6A92` |
| Selected Marker | `#C89B3C` |

---

# Shadows

Use subtle shadows only.

Example:

```css
box-shadow: 0 2px 6px rgba(60, 49, 40, 0.08);
```

Avoid large floating shadows.

---

# Icons

Icons should use:

Default:

`#75675A`

Active:

`#4C6A92`

Error:

`#8A3C3C`

---

# Typography

The interface uses modern typography combined with a warm visual language.

Recommended fonts:

UI

- Geist
- Inter

Headings

- Cormorant Garamond
- Libre Baskerville
- Crimson Text

Only headings should use serif fonts.

Body text should remain clean and highly readable.

---

# Visual Inspiration

The interface should evoke the feeling of:

- Vintage postcard albums
- Old travel journals
- Handwritten notebooks
- Paper maps
- Scrapbooks

The application should feel nostalgic without appearing outdated.

Modern usability always takes priority over decorative elements.
