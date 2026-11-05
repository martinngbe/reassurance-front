
import type { Quittance } from "@/services/quittances/quittance/quittance";
import type { Devise } from "@/services/referentiel/devise/devise";
import type { BaseEntity } from "@/type/base-entity";

export interface EcheancePmd extends BaseEntity {
    
       
    numeroTranche?: string
    periode?: string;
    dateEcheance: string;
    prime: number;
    isAnnule?: boolean;
      
    // Information EcheancePmdPlacement
    quittancePlacementId?: number | null;
    // Autre Information
    isManuel?: boolean;
    echeancePmdIdAnnule: number | null;

    quittance: Quittance
    quittanceId: number;

  
}

//export type CreateEcheancePmdDto = Omit<EcheancePmd, keyof BaseEntity>;
export type CreateEcheancePmdDto = Omit<EcheancePmd, keyof BaseEntity | 'quittance'>;
export type UpdateEcheancePmdDto = Partial<CreateEcheancePmdDto>;



// ✅ Type pour les données du formulaire (paysId et domaineActiviteId peuvent être des objets)
export type EcheancePmdFormData = Partial<Omit<EcheancePmd, 
    'quittance' | 'quittanceId' 
     >> & {
 
  quittanceId: number | Quittance;
};
