
import type { BaseEntity } from "@/type/base-entity";
import type { PaginationParams } from "@/type/pagination";

export interface SousBranche extends BaseEntity {
  brancheId: number;
  code: string;
  libelle: string;
}

export type CreateSousBrancheDto = Omit<SousBranche, keyof BaseEntity>;
export type UpdateSousBrancheDto = Partial<CreateSousBrancheDto>;

export interface SousBrancheParams extends PaginationParams {
  isCession?: boolean | null;
}