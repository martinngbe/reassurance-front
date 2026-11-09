
import type { BaseEntity } from "@/type/base-entity";

export interface CompteType extends BaseEntity {
  code: string;
  libelle: string;
  
  
}

export type CreateCompteTypeDto = Omit<CompteType, keyof BaseEntity>;
export type UpdateCompteTypeDto = Partial<CreateCompteTypeDto>;