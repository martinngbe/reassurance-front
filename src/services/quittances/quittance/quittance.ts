
import type { Police } from "@/services/polices/police/police";
import type { Devise } from "@/services/referentiel/devise/devise";
import type { Mouvement } from "@/services/referentiel/mouvement/mouvement";
import type { Pays } from "@/services/referentiel/pays/pays";
import type { BaseEntity } from "@/type/base-entity";
import type { QuittancePlacement } from "../quittance-placement/quittance-placement";

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
  nombrePlein: number;
  sinistreAuComptant?: number;
  avisSinistre?: number;
  ///////////////////////////// 
  ////// Capitaux 
  /////////////////////////////
  capitaux: number; 
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
  primeCedee: number;
  primeAcceptee: number;  
  ///////////////////////////// 
  ////// Taux et Taxes 
  /////////////////////////////
  //tauxCession: number;
  //tauxRetention: number;

  tauxCedante: number;
  tauxAccepte: number;
  tauxCommission: number;
  commissionFixe: number;
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

  quittancePlacements: QuittancePlacement[]
 
}

export type CreateQuittanceDto = Omit<Quittance, keyof BaseEntity>;
export type UpdateQuittanceDto = Partial<CreateQuittanceDto>;

// ✅ Type pour les données du formulaire (paysId et domaineActiviteId peuvent être des objets)
// export type QuittanceFormData = Partial<Omit<Quittance, 'paysId' >> & {
//   paysId: number | Pays;
// };

// ✅ Type pour les données du formulaire (paysId et domaineActiviteId peuvent être des objets)
export type QuittanceFormData = Partial<Omit<Quittance, 
    'mouvementId' | 
    'policeId' | 
    'deviseId'
     >> & {
  mouvementId?: number | Mouvement  |  null  ;
  policeId: number | Police;
  deviseId: number | Devise;
};

