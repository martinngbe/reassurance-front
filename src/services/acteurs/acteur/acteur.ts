
import type { BaseEntity } from "@/type/base-entity";

export interface Acteur extends BaseEntity {
  numero: string;
  sigle: string;
  raisonSociale: number
  email?: number
  isCourtier: boolean ;
  isCompagnieAssurance: boolean;
  isReassureur: boolean;  
  paysId: number;
}

export type CreateActeurDto = Omit<Acteur, keyof BaseEntity>;
export type UpdateActeurDto = Partial<CreateActeurDto>;