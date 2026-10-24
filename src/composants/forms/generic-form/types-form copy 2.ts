// ✅ Imports des types depuis les composants sources
import type { CalendarSelectionMode, CalendarSize, CalendarVariant } from '../TCalendar.vue'
import type { DatePickerOutputFormat } from '../TDatePicker.vue'

// 🆕 Type pour la signature de loadOptions (aligné sur TAsyncSelect)
export type AsyncSelectLoadOptions = (
  query: string,
  page: number,
) => Promise<{ options: any[]; hasMore: boolean }>

export interface FieldConfig {
  key: string
  label?: string
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea' | 'select' | 'async-select' | 'checkbox' | 'calendar'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: Array<{ label: string; value: string | number }>
  helpText?: string
  
  // Props pour le layout (combo 1+2)
  colSpan?: 1 | 2 | 3 | 'full'
  section?: string
  
  // Props spécifiques async-select
  loadOptions?: AsyncSelectLoadOptions
  asyncOptions?: {
    trackBy?: string
    labelBy?: string
  }
  autoSelectFirst?: boolean
  
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