
import type { Pays } from "@/services/referentiel/pays/pays";
import type { BaseEntity } from "@/type/base-entity";
import type { Assure } from "../acteurs/assure/assure";
import type { Acteur } from "../acteurs/acteur/acteur";
import type { SousBranche } from "../referentiel/sous-branche/sous-branche";

export interface TempPolice extends BaseEntity {
  numero: string;
  isCession?: boolean;
  isReconductionTacite?: boolean;
  isIard?: boolean // IARD | VIE 
  isFacPure?: boolean // FAC PURE | FAC XLS 
  // Relations
  sousBranche: SousBranche
  sousBrancheId: number;

  acteurCedante: Acteur
  acteurCedanteId: number;

  acteurCourtier?: Acteur
  acteurCourtierId?: number;

  assure?: Assure
  assureId?: number
}

export type CreateTempPoliceDto = Omit<TempPolice, keyof BaseEntity>;
export type UpdateTempPoliceDto = Partial<CreateTempPoliceDto>;

// ✅ Type pour les données du formulaire (paysId et domaineActiviteId peuvent être des objets)
export type TempPoliceFormData = Partial<Omit<TempPolice, 
    'assureId' | 
    'acteurCourtierId' | 
    'acteurCedanteId' | 
    'sousBrancheId' >> & {
  assureId: number | Assure;
  acteurCourtierId: number | Acteur;
  acteurCedanteId: number | Acteur;
  sousBrancheId: number | SousBranche;
};

