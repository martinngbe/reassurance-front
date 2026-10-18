
import type { BaseEntity } from "@/type/base-entity";

export interface SousBranche extends BaseEntity {
  brancheId: number;
  code: string;
  libelle: string;
}

export type CreateSousBrancheDto = Omit<SousBranche, keyof BaseEntity>;
export type UpdateSousBrancheDto = Partial<CreateSousBrancheDto>;