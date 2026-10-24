
import type { BaseEntity } from "@/type/base-entity";

export interface NatureCession extends BaseEntity {
  code: string;
  libelle: string;
}

export type CreateNatureCessionDto = Omit<NatureCession, keyof BaseEntity>;
export type UpdateNatureCessionDto = Partial<CreateNatureCessionDto>;