
import type { BaseEntity } from "@/type/base-entity";

export interface Campagne extends BaseEntity {
  code: string;
  libelle: string;
  dateDebut: string; // ISO 'YYYY-MM-DD'
  dateFin: string;
  isActif: boolean;
}

export type CreateCampagneDto = Omit<Campagne, keyof BaseEntity>;
export type UpdateCampagneDto = Partial<CreateCampagneDto>;