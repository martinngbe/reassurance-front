
import type { Pays } from "@/services/referentiel/pays/pays";
import type { BaseEntity } from "@/type/base-entity";
import type { Quittance } from "../quittance/quittance";
import type { Acteur } from "@/services/acteurs/acteur/acteur";

export interface QuittanceCession extends BaseEntity {
  quittanceCessionId: number;
 
  taux: number;
  isCession?: boolean;
  isProportionnel?: boolean;
  isFac?: boolean;
  isAnnule?: boolean;
  // Relations
  quittanceCessionAnnule?: QuittanceCession
  quittanceCessionIdAnnule?: number;

  quittance: Quittance
  quittanceId: number;

  acteur: Acteur
  acteurId: number;

  natureCessionId: number;
}

export type CreateQuittanceCessionDto = Omit<QuittanceCession, keyof BaseEntity>;
export type UpdateQuittanceCessionDto = Partial<CreateQuittanceCessionDto>;

