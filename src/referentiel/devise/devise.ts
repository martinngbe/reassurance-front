
import type { BaseEntity } from "@/type/base-entity";

export interface Devise extends BaseEntity {
  code: string;
  libelle: string;
  cours: number
}

export type CreateDeviseDto = Omit<Devise, keyof BaseEntity>;
export type UpdateDeviseDto = Partial<CreateDeviseDto>;