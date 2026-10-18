
import type { BaseEntity } from "@/type/base-entity";

export interface Region extends BaseEntity {
  code: string;
  libelle: string;
}

export type CreateRegionDto = Omit<Region, keyof BaseEntity>;
export type UpdateRegionDto = Partial<CreateRegionDto>;