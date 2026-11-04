
import type { BaseEntity } from "@/type/base-entity";

export interface NaturePlacement extends BaseEntity {
  code: string;
  libelle: string;
}

export type CreateNaturePlacementDto = Omit<NaturePlacement, keyof BaseEntity>;
export type UpdateNaturePlacementDto = Partial<CreateNaturePlacementDto>;