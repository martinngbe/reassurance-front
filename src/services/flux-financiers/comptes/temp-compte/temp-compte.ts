
import type { BaseEntity } from "@/type/base-entity";
import type { CompteType } from "../compte-type/compte-type";

export interface TempCompte extends BaseEntity {
  numero?:string
  solde: number;

  quittanceId: number; 
  quittancePlacementId?: number | null;  
  
  deviseId: number;
  coursDevise: number; 
  compteIdAnnule?: number;

  compteType: CompteType
  compteTypeId: number;
}

export type CreateTempCompteDto = Omit<TempCompte, keyof BaseEntity>;
export type UpdateTempCompteDto = Partial<CreateTempCompteDto>;

// ✅ Type pour les données du formulaire (paysId et domaineActiviteId peuvent être des objets)
export type TempCompteFormData = Partial<Omit<TempCompte, 'compteTypeId'  >> & {
  compteTypeId: number | CompteType;
};


