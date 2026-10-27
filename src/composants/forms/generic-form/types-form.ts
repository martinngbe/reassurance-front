// types-form.ts

import type { FormatNumberOptions } from '@/utilitaire/number.ts'
import type { CalendarSelectionMode, CalendarSize, CalendarVariant } from '../TCalendar.vue'
import type { DatePickerOutputFormat } from '../TDatePicker.vue'

// ==================== SECTION (titre de groupe) ====================
export interface SectionHeader {
  section: string
}

// ==================== CHAMP ====================
export interface FieldConfig {
  key: string
  label?: string
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea' | 'select' | 'async-select' | 'checkbox' | 'calendar'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: Array<{ label: string; value: string | number }>
  helpText?: string
  // Props pour le layout
  colSpan?: 1 | 2 | 3 | 'full'
 

 // ✅ NOUVEAU
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl'
  maxlength?: number





  // Props spécifiques async-select
  loadOptions?: (query: string, page: number) => Promise<{ options: any[]; hasMore: boolean }>
  asyncOptions?: {
    trackBy?: string
    labelBy?: string
  }
  autoSelectFirst?: boolean
    // ✅ NOUVEAU
  numberOptions?: {
    decimals?: number
    formatOptions?: FormatNumberOptions
    returnType?: 'string' | 'number'
  }

  // Props spécifiques calendar
  calendarOptions?: {
    selectionMode?: CalendarSelectionMode
    locale?: string
    firstDayOfWeek?: 0 | 1
    minDate?: Date | string | null
    maxDate?: Date | string | null
    disabledDates?: Date[] | ((date: Date) => boolean)
    highlightedDates?: Date[]
    size?: CalendarSize
    variant?: CalendarVariant
    showOutsideDays?: boolean
    dateFormat?: Intl.DateTimeFormatOptions | (() => Intl.DateTimeFormatOptions)
    outputFormat?: DatePickerOutputFormat
    clearable?: boolean
  }
}

// ==================== TYPE UNIFIÉ ====================
export type FormField = FieldConfig | SectionHeader

// ==================== TYPE GUARDS ====================
export function isSection(field: FormField): field is SectionHeader {
  return 'section' in field && !('key' in field)
}

export function isField(field: FormField): field is FieldConfig {
  return 'key' in field && 'type' in field
}