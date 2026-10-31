
import type { BaseEntity } from "@/type/base-entity";

export interface Branche extends BaseEntity {
  code: string;
  libelle: string;
  isRetroConventionnelle: boolean
}

export type CreateBrancheDto = Omit<Branche, keyof BaseEntity>;
export type UpdateBrancheDto = Partial<CreateBrancheDto>;