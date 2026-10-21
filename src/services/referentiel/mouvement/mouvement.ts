
import type { BaseEntity } from "@/type/base-entity";

export interface Mouvement extends BaseEntity {
  code: string;
  libelle: string;
}

export type CreateMouvementDto = Omit<Mouvement, keyof BaseEntity>;
export type UpdateMouvementDto = Partial<CreateMouvementDto>;