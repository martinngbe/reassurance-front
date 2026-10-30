
import type { Pays } from "@/services/referentiel/pays/pays";
import type { BaseEntity } from "@/type/base-entity";
import type { Assure } from "../../acteurs/assure/assure";
import type { Acteur } from "../../acteurs/acteur/acteur";
import type { SousBranche } from "../../referentiel/sous-branche/sous-branche";
import type { NatureOffre } from "../../referentiel/nature-offre/nanture-offre";

export interface Police extends BaseEntity {
  numero: string;
  isCession: boolean; // ACCEPTATION | CESSION 
  isIard?: boolean // IARD | VIE
  isFac?: boolean // FAC | TRAITE 
  isReconductionTacite: boolean;
  // Relations

  natureOffre: NatureOffre
  natureOffreId: number;

  sousBranche: SousBranche
  sousBrancheId: number;

  acteurCedante: Acteur
  acteurCedanteId: number;

  acteurCourtier?: Acteur
  acteurCourtierId?: number;

  assure?: Assure
  assureId?: number
}

export type CreatePoliceDto = Omit<Police, keyof BaseEntity>;
export type UpdatePoliceDto = Partial<CreatePoliceDto>;

// ✅ Type pour les données du formulaire (paysId et domaineActiviteId peuvent être des objets)
export type PoliceFormData = Partial<Omit<Police, 'paysId' >> & {
  paysId: number | Pays;
};
