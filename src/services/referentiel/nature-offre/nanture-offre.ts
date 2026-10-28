
import type { BaseEntity } from "@/type/base-entity";

export interface NatureOffre extends BaseEntity {
  code: string;
  libelle: string;
  isFacultative: boolean;
  isFacObligatoire: boolean;
  isProportionnelle: boolean;
  isEdp: boolean;
  isQuotePart: boolean;
  isXs: boolean;
}

export type CreateNatureOffreDto = Omit<NatureOffre, keyof BaseEntity>;
export type UpdateNatureOffreDto = Partial<CreateNatureOffreDto>;