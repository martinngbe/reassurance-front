
import type { BaseEntity } from "@/type/base-entity";
import type { PaginationParams } from "@/type/pagination";

export interface CessionLegale extends BaseEntity {
  acteurId: number;
  taux: number;
  isFac: boolean;
}

export type CreateCessionLegaleDto = Omit<CessionLegale, keyof BaseEntity>;
export type UpdateCessionLegaleDto = Partial<CreateCessionLegaleDto>;

export interface CessionLegaleParams extends PaginationParams {
  isCession?: boolean | null;
}