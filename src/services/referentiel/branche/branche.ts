
import type { BaseEntity } from "@/type/base-entity";
import type { PaginationParams } from "@/type/pagination";

export interface Branche extends BaseEntity {
  code: string;
  libelle: string;
  isRetroConventionnelle: boolean
}

export type CreateBrancheDto = Omit<Branche, keyof BaseEntity>;
export type UpdateBrancheDto = Partial<CreateBrancheDto>;

export interface BrancheParams extends PaginationParams {
  isCession?: boolean | null;
}