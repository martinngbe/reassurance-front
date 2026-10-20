
import type { Pays } from "@/services/referentiel/pays/pays";
import type { BaseEntity } from "@/type/base-entity";

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
