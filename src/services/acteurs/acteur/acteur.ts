
import type { Pays } from "@/services/referentiel/pays/pays";
import type { BaseEntity } from "@/type/base-entity";
import type { PaginationParams } from "@/type/pagination";

export interface Acteur extends BaseEntity {
  numero: string;
  sigle: string;
  raisonSociale: string
  email?: string
  adresse?: string
  telephone?: string
  siteweb?: string
  coordonneesBancaire?: string

  isCourtier: boolean ;
  isCompagnieAssurance: boolean;
  isReassureur: boolean;
  isNous: boolean;  
    // Relations
  pays?: Pays;
  paysId: number;
}

export type CreateActeurDto = Omit<Acteur, keyof BaseEntity>;
export type UpdateActeurDto = Partial<CreateActeurDto>;

// ✅ Type pour les données du formulaire (paysId et domaineActiviteId peuvent être des objets)
export type ActeurFormData = Partial<Omit<Acteur, 'paysId' >> & {
  paysId: number | Pays;
};


// acteur.ts
export interface ActeurFilters {
  isCourtier?: boolean;
  isCompagnieAssurance?: boolean;
  isReassureur?: boolean;
  isNous?: boolean;
}

// // Type pour les "chips" de sélection
// export type ActeurTypeKey = keyof Omit<ActeurFilters, never>;

// export const ACTEUR_TYPES: { key: ActeurTypeKey; label: string }[] = [
//   { key: 'isCourtier', label: 'Courtiers' },
//   { key: 'isCompagnieAssurance', label: 'Compagnies d\'assurance' },
//   { key: 'isReassureur', label: 'Réassureurs' },
//   { key: 'isNous', label: 'Nous' },
// ];


// ✅ Nouveau type pour les paramètres de requête avec filtres
export interface ActeurParams extends PaginationParams {
  filters?: {
    isCourtier?: boolean;
    isCompagnieAssurance?: boolean;
    isReassureur?: boolean;
    isNous?: boolean;
  };
}

// acteur.ts
export type ActeurTypeFilter = 'courtier' | 'cedante' | 'reassureur' | 'nous' | null;

export interface ActeurParams extends PaginationParams {
  typeFiltre?: ActeurTypeFilter;
}



// ✅ Clés possibles pour le filtre
export type ActeurTypeKey = 'courtier' | 'cedante' | 'reassureur' | 'nous';

// ✅ Nouveau type pour les paramètres (hérite de PaginationParams)
export interface ActeurParams extends PaginationParams {
  roles?: string; // ⭐ Chaîne type "courtier,reassureur"
  typesFiltre?: ActeurTypeKey[]; 
}
