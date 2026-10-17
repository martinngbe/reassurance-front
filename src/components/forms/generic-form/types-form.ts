// types-form.ts
import type { CalendarSelectionMode, CalendarSize, CalendarVariant } from '../TCalendar.vue'

export type FieldType =
  | 'text' | 'number' | 'email' | 'password'
  | 'textarea' | 'select' | 'checkbox' | 'date'
  | 'calendar' | 'async-select'

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

// export interface FieldConfig {
//   key: string
//   label: string
//   type: FieldType
//   required?: boolean
//   placeholder?: string
//   options?: FieldOption[]
//   disabled?: boolean
//   helpText?: string
//   /** Options spécifiques au type 'calendar' */
//   calendarOptions?: CalendarFieldOptions
//   textareaOptions?: TextAreaOptions // 🆕

//     // Nouvelles propriétés pour le scroll infini
//   resolve?: (query: string, currentOptions: any[]) => Promise<{ options: any[], hasMore: boolean }>
//   asyncOptions?: {
//     trackBy?: string // ex: 'id'
//     labelBy?: string // ex: 'name'
//   }
// }

// /components/forms/generic-form/types-form.ts

export interface FieldConfig {
  key: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox' | 'calendar' | 'async-select'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  helpText?: string
  
  // Pour le select natif (petites listes statiques)
  options?: FieldOption[]
  
  // 🆕 Pour le scroll infini (TAsyncSelect)
  // Fonction qui charge les options avec pagination
  // query: texte recherché par l'utilisateur
  // page: numéro de page à charger (1, 2, 3...)
  loadOptions?: (query: string, page: number) => Promise<{ options: any[], hasMore: boolean }>
  
  // Configuration pour TAsyncSelect
  asyncOptions?: {
    trackBy?: string  // Clé de l'ID dans l'objet API (ex: 'id')
    labelBy?: string  // Clé du texte affiché (ex: 'libelle', 'name')
  }
  
  // Pour le calendar
  calendarOptions?:CalendarFieldOptions
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

