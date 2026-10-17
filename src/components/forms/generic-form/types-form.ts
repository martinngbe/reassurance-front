// types-form.ts
import type { CalendarSelectionMode, CalendarSize, CalendarVariant } from '../TCalendar.vue'

export type FieldType =
  | 'text' | 'number' | 'email' | 'password'
  | 'textarea' | 'select' | 'checkbox' | 'date'
  | 'calendar'

export interface FieldOption {
  label: string
  value: string | number | boolean
}

export interface CalendarFieldOptions {
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
  outputFormat?: 'iso' | 'date' | string
  dateFormat?: Intl.DateTimeFormatOptions
  clearable?: boolean
}

export interface FieldConfig {
  key: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  options?: FieldOption[]
  disabled?: boolean
  helpText?: string
  /** Options spécifiques au type 'calendar' */
  calendarOptions?: CalendarFieldOptions
  textareaOptions?: TextAreaOptions // 🆕
}




export interface FieldOption {
  label: string
  value: string | number | boolean
}

export interface TextAreaOptions {
  rows?: number
  maxlength?: number
  minlength?: number
  autoResize?: boolean
  showCounter?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'soft' | 'outline'
}

