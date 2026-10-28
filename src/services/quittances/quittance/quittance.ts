
import type { Police } from "@/services/polices/police/police";
import type { Devise } from "@/services/referentiel/devise/devise";
import type { Mouvement } from "@/services/referentiel/mouvement/mouvement";
import type { Pays } from "@/services/referentiel/pays/pays";
import type { BaseEntity } from "@/type/base-entity";

export interface Quittance extends BaseEntity {
 numero: string;
  ////// Hérité de l'entité TempPolice
  // isCession?: boolean; 
  //isProportionnel?: boolean;
  //isFac?: boolean;
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
 
  ///////////////////////////// 
  ////// Prime 
  /////////////////////////////
  estimationPrime: number; 
  primeBrute: number;
  primeNette: number;  
  ///////////////////////////// 
  ////// Taux et Taxes 
  /////////////////////////////
  tauxCession: number;
  tauxRetention: number;

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

  police: Police
  policeId: number;

  devise: Devise
  deviseId: number;
 
}

export type CreateQuittanceDto = Omit<Quittance, keyof BaseEntity>;
export type UpdateQuittanceDto = Partial<CreateQuittanceDto>;

// ✅ Type pour les données du formulaire (paysId et domaineActiviteId peuvent être des objets)
export type QuittanceFormData = Partial<Omit<Quittance, 'paysId' >> & {
  paysId: number | Pays;
};
