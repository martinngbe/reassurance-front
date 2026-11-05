
import type { Quittance } from "@/services/quittances/quittance/quittance";
import type { Devise } from "@/services/referentiel/devise/devise";
import type { BaseEntity } from "@/type/base-entity";

export interface Bordereau extends BaseEntity {
    
    numero?: string  | null
    reference? : string  | null
    dateReception?: Date | null;
    periodeDebut?: Date | null;
    periodeFin?: Date | null;
    ///Information Bordereau
   
    coursDevise: number 
    primeBrute: number
    primeNette?: number
    tauxCedante?: number
    tauxAccepte:number
    tauxCession?: number
    commissionFixe?: number    
    tauxCommission?: number    
    taxeSurCommission?: number    
    taxeSurPrime?: number
    primeCedee?: number    
    primeAcceptee?:number 
    // Information BordereauPlacement
    quittancePlacementId?: number | null;
    // Autre Information
    isManuel?: boolean;    
    isAnnule?: boolean;    
    bordereauIdAnnule: number | null;


    quittance: Quittance
    quittanceId: number;

    devise: Devise
    deviseId: number;
  
}

//export type CreateBordereauDto = Omit<Bordereau, keyof BaseEntity>;
export type CreateBordereauDto = Omit<Bordereau, keyof BaseEntity | 'quittance' | 'devise'>;
export type UpdateBordereauDto = Partial<CreateBordereauDto>;



// ✅ Type pour les données du formulaire (paysId et domaineActiviteId peuvent être des objets)
export type BordereauFormData = Partial<Omit<Bordereau, 
    'quittance' | 'devise' | 'quittanceId' | 'deviseId'
     >> & {
 
  quittanceId: number | Quittance;
  deviseId: number | Devise;
};
