
import type { Devise } from "@/services/referentiel/devise/devise";
import type { Mouvement } from "@/services/referentiel/mouvement/mouvement";
import type { Pays } from "@/services/referentiel/pays/pays";
import type { TempPolice } from "@/services/temp-police/temp-police";
import type { BaseEntity } from "@/type/base-entity";

export interface TempQuittance extends BaseEntity {
  numero: string;
  ////// Hérité de l'entité TempPolice
  isCession?: boolean; 
  isProportionnel?: boolean;
  isFac?: boolean;
  ///////////////////////////// 
  ////// Emission 
  /////////////////////////////  
  dateEmission?: string;
  dateEffet?: string;
  dateEcheance?: string;
  coursDevise: number;
  avisEcheance?: number;
  nombreEcheancePmd: number;
  sinistreAuComptant?: number;
  avisSinistre?: number;
  ///////////////////////////// 
  ////// Capitaux 
  /////////////////////////////
  capitaux: number; 
  //limiteCapitauxImpliques: number;
  lci: number;
  smp: number;
  limite: number;
  retention: number;
  conservation: number;
  capacite: number;
  estimationPrime: number; 
  ///////////////////////////// 
  ////// Prime 
  /////////////////////////////
  primeBrute: number;
  primeNette: number;  
  ///////////////////////////// 
  ////// Taux et Taxes 
  /////////////////////////////
  tauxCedante: number;
  tauxAccepte: number;
  tauxCommission: number;
  taxeSurPrime: number;
  taxeSurCommission: number;
  ///////////////////////////// 
  ////// Autres 
  /////////////////////////////

  aliment?: number;    
  ////// Relation
  mouvement: Mouvement
  mouvementId: number;

  police: TempPolice
  policeId: number;

  devise: Devise
  deviseId: number;
 

}

export type CreateTempQuittanceDto = Omit<TempQuittance, keyof BaseEntity>;
export type UpdateTempQuittanceDto = Partial<CreateTempQuittanceDto>;

// ✅ Type pour les données du formulaire (paysId et domaineActiviteId peuvent être des objets)
export type TempQuittanceFormData = Partial<Omit<TempQuittance, 'mouvementId'|'policeId'|'deviseId' >> & {
  mouvementId: number | Mouvement;
  policeId: number | TempPolice;
  deviseId: number | Devise;
};
 
