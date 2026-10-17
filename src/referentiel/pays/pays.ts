
import type { BaseEntity } from "@/type/base-entity";

export interface Pays extends BaseEntity {
  indicatif: string;
  code: string;
  libelle: string;
  regionId: number
}

export type CreatePaysDto = Omit<Pays, keyof BaseEntity>;
export type UpdatePaysDto = Partial<CreatePaysDto>;