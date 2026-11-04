import type { BaseEntity } from '@/type/base-entity'
import type { Quittance } from '../quittance/quittance'
import type { Acteur } from '@/services/acteurs/acteur/acteur'
import type { NaturePlacement } from '@/services/referentiel/nature-placement/nature-placement'

export interface QuittancePlacement extends BaseEntity {
  numero: string
  tauxCession: number 
  tauxCommission: number 
  commissionFixe: number 

  isAnnule?: boolean

  // Relations
  quittance: Quittance
  quittanceId: number

  acteur: Acteur
  acteurId: number

  naturePlacement: NaturePlacement
  naturePlacementId: number

  quittancePlacementAnnule?: QuittancePlacement | null
  quittancePlacementIdAnnule?: number | null
}

// export type CreateQuittancePlacementDto = Omit<
//   QuittancePlacement,
//   keyof BaseEntity | 'quittance' | 'acteur' | 'naturePlacement' | 'quittancePlacementAnnule'
// >

// export type UpdateQuittancePlacementDto = Partial<CreateQuittancePlacementDto>

/** Ce que manipule le formulaire : les FK peuvent être des objets (TAsyncSelect) */
// export type QuittancePlacementFormData = {
//   taux?: number | string | null
//   tauxCession?: number | string | null
//   tauxCommission?: number | string | null
//   commissionFixe?: number | string | null
//   // isPlacement?: boolean
//   // isProportionnel?: boolean
//   // isFac?: boolean
//   // isAnnule?: boolean
//   quittanceId?: number | Quittance | null
//   acteurId?: number | Acteur | null
//   naturePlacementId?: number | NaturePlacement | null
//   quittancePlacementIdAnnule?: number | QuittancePlacement | null
// }

// export type QuittancePlacementQuery = PaginationParams & { quittanceId?: number }

// ✅ Type pour les données du formulaire (paysId et domaineActiviteId peuvent être des objets)


export type CreateQuittancePlacementDto = Omit<QuittancePlacement, keyof BaseEntity>;
export type UpdateQuittancePlacementDto = Partial<CreateQuittancePlacementDto>;


export type QuittancePlacementFormData = Partial<Omit<QuittancePlacement, 
    'quittanceId' | 
    'acteurId' | 
    'naturePlacementId' |
    'quittancePlacementIdAnnule'
     >> & {
  quittanceId?: number | Quittance   ;
  acteurId: number | Acteur;
  naturePlacementId: number | NaturePlacement;
  quittancePlacementIdAnnule: number | QuittancePlacement;
};

