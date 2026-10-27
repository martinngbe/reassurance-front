/* ----- Boutons ----- */
export type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg'  | 'xl' | '2xl'
export type ButtonType = 'button' | 'submit' | 'reset'

/* ----- Options (select, radio…) ----- */
export type Primitive = string | number | boolean
export type OptionValue = Primitive | Record<string, unknown>

export interface Option<V extends OptionValue = OptionValue> {
  label: string
  value: V
  disabled?: boolean
}

/** Accepte soit des objets { label, value }, soit des valeurs brutes. */
export type OptionsInput<V extends OptionValue = OptionValue> = ReadonlyArray<Option<V> | V>

export function normalizeOptions<V extends OptionValue>(
  options: OptionsInput<V>,
): Array<Option<V>> {
  return options.map((o): Option<V> => {
    if (typeof o === 'object' && o !== null && 'label' in o && 'value' in o) {
      return o as Option<V>
    }
    return { label: String(o), value: o as V }
  })
}

/* ----- Checkbox (booléen seul OU groupe de valeurs) ----- */
export type CheckboxModel = boolean | OptionValue[]

export type TableRow = Record<string, unknown>

export interface TableColumn {
  key: string
  label: string
  // ✨ Élargir pour accepter '50%', '200px', ou 200
  width?: string | number
  minWidth?: string | number
  sortable?: boolean
  resizable?: boolean
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  // ... autres propriétés
}
//export type TableRow = Record<string, any>

export type SortDirection = 'asc' | 'desc' | null

export interface SortState {
  key: string | null
  direction: SortDirection
}

export type Density = 'sm' | 'md' | 'lg'

// Ajouter à la fin du fichier existant
export interface ZoneConfig {
  /** Active la zone (false = n'existe pas du tout, 0px) */
  enabled?: boolean
  /** Affiche la zone (false = réduite à collapsedSize) */
  visible?: boolean
  /** Taille par défaut (largeur pour left/right, hauteur pour header/footer) */
  size?: string
  /** Taille minimale lors du resize */
  minSize?: string
  /** Si true → pas de splitter, zone fixe */
  fixed?: boolean
  /** Taille quand masquée (≈ largeur/hauteur du toggle) */
  collapsedSize?: string
}
