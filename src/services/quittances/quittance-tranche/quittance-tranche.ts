import type { BaseEntity } from '@/type/base-entity'
import type { Quittance } from '../quittance/quittance'

export interface QuittanceTranche extends BaseEntity {
  numeroTranche: number
  estimationPrime: number;
  tauxPrime: number 
  tauxCommission: number 
  primeTranche?: number
  isAnnule?: boolean

  // Relations
  quittance: Quittance
  quittanceId: number

  quittanceTrancheAnnule?: QuittanceTranche | null
  quittanceTrancheIdAnnule?: number | null
}

export type CreateQuittanceTrancheDto = Omit<QuittanceTranche, keyof BaseEntity>;
export type UpdateQuittanceTrancheDto = Partial<CreateQuittanceTrancheDto>;


export type QuittanceTrancheFormData = Partial<Omit<QuittanceTranche, 
    'quittanceId' | 
    'quittanceTrancheIdAnnule'
     >> & {
  quittanceId?: number | Quittance   ; 
  quittanceTrancheIdAnnule: number | QuittanceTranche;
};

