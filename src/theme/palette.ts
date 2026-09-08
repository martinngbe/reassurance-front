export interface Rgb {
  r: number
  g: number
  b: number
}

export type Shade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950
export type Palette = Record<Shade, string>

const WHITE: Rgb = { r: 255, g: 255, b: 255 }
const BLACK: Rgb = { r: 23, g: 23, b: 23 }

export function hexToRgb(hex: string): Rgb {
  let h = hex.replace('#', '').trim()
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  const int = Number.parseInt(h, 16)
  if (Number.isNaN(int) || h.length !== 6) return { r: 99, g: 102, b: 241 }
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }
}

export function rgbToHex({ r, g, b }: Rgb): string {
  return (
    '#' +
    [r, g, b]
      .map((v) =>
        Math.max(0, Math.min(255, Math.round(v)))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  )
}

function mix(a: Rgb, b: Rgb, weight: number): Rgb {
  return {
    r: a.r * (1 - weight) + b.r * weight,
    g: a.g * (1 - weight) + b.g * weight,
    b: a.b * (1 - weight) + b.b * weight,
  }
}

/** Palette complète 50 → 950 à partir d'une seule couleur (500). */
export function generatePalette(hex: string): Palette {
  const base = hexToRgb(hex)
  return {
    50: rgbToHex(mix(base, WHITE, 0.93)),
    100: rgbToHex(mix(base, WHITE, 0.85)),
    200: rgbToHex(mix(base, WHITE, 0.7)),
    300: rgbToHex(mix(base, WHITE, 0.5)),
    400: rgbToHex(mix(base, WHITE, 0.25)),
    500: rgbToHex(base),
    600: rgbToHex(mix(base, BLACK, 0.12)),
    700: rgbToHex(mix(base, BLACK, 0.28)),
    800: rgbToHex(mix(base, BLACK, 0.45)),
    900: rgbToHex(mix(base, BLACK, 0.6)),
    950: rgbToHex(mix(base, BLACK, 0.75)),
  }
}

/** Luminance relative (WCAG). */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const lin = (v: number): number => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/** Meilleure couleur de texte sur la couleur primaire (blanc ou sombre). */
export function contrastColor(hex: string): string {
  return relativeLuminance(hex) > 0.45 ? '#171717' : '#ffffff'
}
