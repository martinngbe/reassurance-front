
import type { BaseEntity } from "@/type/base-entity";
import type { TempCompte } from "../temp-compte/temp-compte";
import type { CompteRubrique } from "../compte-rubrique/compte-rubrique";
import type { Devise } from "@/services/referentiel/devise/devise";

export interface TempCompteDetail extends BaseEntity {

  coursDevise: number;
  debit: number;
  credit: number;
 
  compte : TempCompte
  compteId: number;

  compteRubrique: CompteRubrique
  compteRubriqueId: number;

  devise : Devise
  deviseId: number;
  isAnnule?: boolean;
  compteDetailIdAnnule?: number |  null;

}

export type CreateTempCompteDetailDto = Omit<TempCompteDetail, keyof BaseEntity>;
export type UpdateTempCompteDetailDto = Partial<CreateTempCompteDetailDto>;



// ✅ Type pour les données du formulaire (paysId et domaineActiviteId peuvent être des objets)
export type TempCompteDetailFormData = Partial<Omit<TempCompteDetail, 'deviseId' |'compteRubriqueId' | 'compteId'  >> & {
  deviseId: number | Devise;
  compteRubriqueId: number |CompteRubrique;
  compteId: number | TempCompte
};

