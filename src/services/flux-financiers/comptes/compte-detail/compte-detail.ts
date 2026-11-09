
import type { BaseEntity } from "@/type/base-entity";

export interface CompteDetail extends BaseEntity {
 

  debit: number;
  credit: number;

  isAnnule: boolean;
  compteDetailIdAnnule: number;

  
  compteId: number;
  compteRubriqueId: number;
  DeviseId: number;
  coursDevise: number;
}

export type CreateCompteDetailDto = Omit<CompteDetail, keyof BaseEntity>;
export type UpdateCompteDetailDto = Partial<CreateCompteDetailDto>;


