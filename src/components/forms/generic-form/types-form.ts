// types/form.ts
export type FieldType =
  | 'text' | 'number' | 'email' | 'password'
  | 'textarea' | 'select' | 'checkbox' | 'date';

export interface FieldOption {
  label: string;
  value: string | number | boolean;
}

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: FieldOption[];
  disabled?: boolean;
  helpText?: string;       // ← petit plus : texte d'aide sous le champ
}