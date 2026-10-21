
import type { Pays } from "@/services/referentiel/pays/pays";
import type { BaseEntity } from "@/type/base-entity";

export interface Quittance extends BaseEntity {
  numero: string;
  mouvementId: number;
  policeId: number;
  deviseId: number;
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
  isAnnule?: boolean;

  // Relations
  quittancennule: Quittance
  quittanceIdAnnule: number;
}

export type CreateQuittanceDto = Omit<Quittance, keyof BaseEntity>;
export type UpdateQuittanceDto = Partial<CreateQuittanceDto>;

// ✅ Type pour les données du formulaire (paysId et domaineActiviteId peuvent être des objets)
export type QuittanceFormData = Partial<Omit<Quittance, 'paysId' >> & {
  paysId: number | Pays;
};
