
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


// ✅ Clés possibles pour le filtre
export type ActeurTypeKey = 'courtier' | 'cedante' | 'reassureur' | 'nous';

// ✅ Nouveau type pour les paramètres (hérite de PaginationParams)
export interface ActeurParams extends PaginationParams {
  roles?: string; // ⭐ Chaîne type "courtier,reassureur"
  typesFiltre?: ActeurTypeKey[]; 
}
