import { describe, expect, it } from 'vitest'
import {
  contrastColor,
  generatePalette,
  hexToRgb,
  relativeLuminance,
  rgbToHex,
} from '../../theme/palette'

describe('palette', () => {
  describe('hexToRgb / rgbToHex', () => {
    it('convertit un hex 6 chiffres en RGB', () => {
      expect(hexToRgb('#eab308')).toEqual({ r: 234, g: 179, b: 8 })
    })
    it('gère la forme courte 3 chiffres', () => {
      expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 })
    })
    it('retourne une valeur de repli si hex invalide', () => {
      expect(hexToRgb('nope')).toEqual({ r: 99, g: 102, b: 241 })
    })
    it("rgbToHex est l'inverse de hexToRgb", () => {
      expect(rgbToHex({ r: 234, g: 179, b: 8 })).toBe('#eab308')
    })
  })

  describe('generatePalette', () => {
    it('génère les 11 nuances', () => {
      expect(Object.keys(generatePalette('#eab308'))).toHaveLength(11)
    })
    it('la nuance 500 correspond à la couleur de base', () => {
      expect(generatePalette('#eab308')[500]).toBe('#eab308')
    })
    it('les nuances claires sont plus lumineuses que la base', () => {
      const p = generatePalette('#eab308')
      expect(relativeLuminance(p[50])).toBeGreaterThan(relativeLuminance(p[500]))
    })
    it('les nuances foncées sont plus sombres que la base', () => {
      const p = generatePalette('#eab308')
      expect(relativeLuminance(p[950])).toBeLessThan(relativeLuminance(p[500]))
    })
  })

  describe('contrastColor', () => {
    it('texte sombre sur couleur claire (jaune)', () => {
      expect(contrastColor('#eab308')).toBe('#171717')
    })
    it('texte blanc sur couleur foncée (indigo)', () => {
      expect(contrastColor('#6366f1')).toBe('#ffffff')
    })
  })

  describe('relativeLuminance', () => {
    it('blanc = 1, noir = 0', () => {
      expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5)
      expect(relativeLuminance('#000000')).toBeCloseTo(0, 5)
    })
  })
})
