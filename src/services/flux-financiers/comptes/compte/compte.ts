
import type { BaseEntity } from "@/type/base-entity";

export interface Compte extends BaseEntity {
 
  compteTypeId: number;
  deviseId: number;
  coursDevise: number;

  numero: string
  solde: number;
  compteIdAnnule?: number| null;   
  quittancePlacementId: number | null;   
}

export type CreateCompteDto = Omit<Compte, keyof BaseEntity>;
export type UpdateCompteDto = Partial<CreateCompteDto>;


