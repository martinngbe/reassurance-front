
import type { BaseEntity } from "@/type/base-entity";

export interface Assure extends BaseEntity {
  numero: string;
  sigle: string;
  raisonSociale: number
  email?: number   
  paysId: number;
  domaineActiviteId: number;
}

export type CreateAssureDto = Omit<Assure, keyof BaseEntity>;
export type UpdateAssureDto = Partial<CreateAssureDto>;