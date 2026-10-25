// src/utilitaire/number.ts

/**
 * Options de formatage d'un nombre
 */
export interface FormatNumberOptions {
  /** Locale pour le formatage (ex: 'fr-FR', 'en-US') */
  locale?: string
  /** Nombre de décimales maximum (par défaut: 0) */
  maximumFractionDigits?: number
  /** Nombre de décimales minimum (par défaut: 0) */
  minimumFractionDigits?: number
  /** Style d'affichage (par défaut: 'decimal') */
  style?: 'decimal' | 'currency' | 'percent'
  /** Code devise si style='currency' (ex: 'EUR', 'USD') */
  currency?: string
}

/**
 * Nettoie une chaîne de caractères pour ne garder que les caractères numériques
 * Gère les virgules françaises et les points anglais
 */
export function cleanNumberString(value: string): string {
  if (!value) return ''
  // On garde chiffres, points, virgules, et le signe moins
  return value.replace(/[^\d.,-]/g, '').replace(',', '.')
}

/**
 * Parse une chaîne en nombre, retourne NaN si invalide
 */
export function parseNumber(value: string): number {
  const cleaned = cleanNumberString(value)
  if (!cleaned || cleaned === '-' || cleaned === '.') return NaN
  return parseFloat(cleaned)
}

/**
 * Formate un nombre avec un séparateur de milliers
 * Retourne une chaîne vide si la valeur n'est pas un nombre valide
 */
export function formatNumber(value: string | number, options: FormatNumberOptions = {}): string {
  if (value === '' || value === null || value === undefined) return ''

  const number = typeof value === 'string' ? parseNumber(value) : value
  if (isNaN(number)) return ''

  const {
    locale = 'fr-FR',
    maximumFractionDigits = 0,
    minimumFractionDigits = 0,
    style = 'decimal',
    currency,
  } = options

  const intlOptions: Intl.NumberFormatOptions = {
    style,
    maximumFractionDigits,
    minimumFractionDigits,
  }

  if (style === 'currency' && currency) {
    intlOptions.currency = currency
  }

  return new Intl.NumberFormat(locale, intlOptions).format(number)
}

/**
 * Raccourcis pratiques
 */
export const formatInteger = (value: string | number, locale = 'fr-FR') =>
  formatNumber(value, { locale, maximumFractionDigits: 0 })

export const formatDecimal = (value: string | number, locale = 'fr-FR', digits = 2) =>
  formatNumber(value, { locale, maximumFractionDigits: digits, minimumFractionDigits: digits })

export const formatCurrency = (value: string | number, currency = 'EUR', locale = 'fr-FR') =>
  formatNumber(value, { locale, style: 'currency', currency, minimumFractionDigits: 2 })