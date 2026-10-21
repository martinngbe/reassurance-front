
import type { Devise } from "@/services/referentiel/devise/devise";
import type { Mouvement } from "@/services/referentiel/mouvement/mouvement";
import type { Pays } from "@/services/referentiel/pays/pays";
import type { TempPolice } from "@/services/temp-police/temp-police";
import type { BaseEntity } from "@/type/base-entity";

export interface TempQuittance extends BaseEntity {
  numero: string;
 
  isCession?: boolean; 
  isProportionnel?: boolean;
  isFac?: boolean;
  dateEmission?: string;
  dateEffet?: string;
  dateEcheance?: string;
  coursDevise: number;
  avisEcheance?: number; 
  capitaux: number; 
  limiteCapitauxImpliques: number;
  ici: number;
  smp: number;
  limite: number;
  retention: number;
  conservation: number;
  capacite: number;
  estimationPrime: number;
  tauxCedante: number;
  tauxAccepte: number;
  tauxCommission: number;
  taxeSurCommission: number;
  primeBrute: number;
  primeNette: number;
  taxeSurPrime: number;
  nombreEcheancePmd: number;
  sinistreAuComptant?: number;
  avisSinistre?: number;
  aliment?: number;

  ////// Relation
  mouvement: Mouvement
  mouvementId: number;

  tempPolice: TempPolice
  tempPoliceId: number;

  devise: Devise
  deviseId: number;
 

}

export type CreateTempQuittanceDto = Omit<TempQuittance, keyof BaseEntity>;
export type UpdateTempQuittanceDto = Partial<CreateTempQuittanceDto>;

// ✅ Type pour les données du formulaire (paysId et domaineActiviteId peuvent être des objets)
export type TempQuittanceFormData = Partial<Omit<TempQuittance, 'mouvementId'|'tempPoliceId'|'deviseId' >> & {
  mouvementId: number | Mouvement;
  tempPoliceId: number | TempPolice;
  deviseId: number | Devise;
};
 
