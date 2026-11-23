
import type { Acteur } from "@/services/acteurs/acteur/acteur";
import type { BaseEntity } from "@/type/base-entity";
import type { PaginationParams } from "@/type/pagination";

export interface CessionLegale extends BaseEntity {
  acteurId: number;
  acteur: Acteur;
  taux: number;
  isFac: boolean;

}

export type CreateCessionLegaleDto = Omit<CessionLegale, keyof BaseEntity>;
export type UpdateCessionLegaleDto = Partial<CreateCessionLegaleDto>;

export interface CessionLegaleParams extends PaginationParams {
  isFacultative?: boolean | null;
}