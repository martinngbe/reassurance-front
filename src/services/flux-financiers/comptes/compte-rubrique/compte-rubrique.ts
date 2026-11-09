
import type { BaseEntity } from "@/type/base-entity";

export interface CompteRubrique extends BaseEntity {
  code: string;
  libelle: string;
  partie :string;
  isNonProportionnel : boolean
  isProportionnel : boolean
  
}

export type CreateCompteRubriqueDto = Omit<CompteRubrique, keyof BaseEntity>;
export type UpdateCompteRubriqueDto = Partial<CreateCompteRubriqueDto>;