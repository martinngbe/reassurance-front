
import type { Pays } from "@/services/referentiel/pays/pays";
import type { BaseEntity } from "@/type/base-entity";
import type { Assure } from "../../acteurs/assure/assure";
import type { Acteur } from "../../acteurs/acteur/acteur";
import type { SousBranche } from "../../referentiel/sous-branche/sous-branche";
import type { NatureOffre } from "../../referentiel/nature-offre/nanture-offre";
import type { TableColumn } from "@/composants/forms/common";

export interface Police extends BaseEntity {
  numero: string;
  isCession: boolean; // ACCEPTATION | CESSION 
  isIard?: boolean // IARD | VIE
  isFac?: boolean // FAC | TRAITE 
  isReconductionTacite: boolean;
  // Relations

  natureOffre: NatureOffre
  natureOffreId: number;

  sousBranche: SousBranche
  sousBrancheId: number;

  acteurCedante: Acteur
  acteurCedanteId: number;

  acteurCourtier?: Acteur
  acteurCourtierId?: number;

  acteurReassureur?: Acteur
  acteurReassureurrId?: number;

  assure?: Assure  | null
  assureId?: number | null
}

export type CreatePoliceDto = Omit<Police, keyof BaseEntity>;
export type UpdatePoliceDto = Partial<CreatePoliceDto>;


// ✅ Type pour les données du formulaire (paysId et domaineActiviteId peuvent être des objets)
export type PoliceFormData = Partial<Omit<Police, 
    'assureId' | 
    'natureOffreId' | 
    'acteurCourtierId' | 
    'acteurCedanteId' |
    'acteurReassureurrId' |
    'sousBrancheId' >> & {
  assureId?: number | Assure  |  null  ;
  natureOffreId: number | NatureOffre;
  acteurCourtierId: number | Acteur;
  acteurCedanteId: number | Acteur;
  acteurReassureurrId: number | Acteur;
  sousBrancheId: number | SousBranche;
};




export function policeAllTableColumns(isEcranTraite:boolean | null ){

                   
          const allColumns: TableColumn[] = [
            { key: 'acteurCedante',          label: 'Cedante',    width: 150,  minWidth: 100, },
            { key: 'numero',                label: 'N°Police',    width: 200,   minWidth: 80 },
            { key: 'isCession',             label: 'Cess°',       width: 50,   minWidth: 80,  align: 'center' },
            { key: 'isFac',                 label: 'FAC',         width: 50,   minWidth: 80,  align: 'center' },
            { key: 'isProportionnelle',     label: 'Propor.',     width: 50,   minWidth: 80,  align: 'center' },
            { key: 'isReconductionTacite',  label: 'Tacite Recond.',   width: 50,  minWidth: 200, align: 'center' },
            
            { key: 'isIard',                label: 'IARD',        width: 50,   minWidth: 80,  align: 'center' },
            { key: 'isCouverte',            label: 'Couverte',    width: 50,   minWidth: 80,  align: 'center' },
            { key: 'isAnnulee',             label: 'Annullée',    width: 50,   minWidth: 80,  align: 'center' },
            { key: 'isSinistree',           label: 'Sinistrée',   width: 50,   minWidth: 80,  align: 'center' },
            { key: 'natureOffre',           label: 'Nature Offre',width: 400,  minWidth: 200, },
          

            { key: 'acteurCourtier',        label: 'Courtier',         width: 500,  minWidth: 500, },
            { key: 'assure',                label: 'Assure',           width: 500,  minWidth: 500,  },
            { key: 'sousBranche',           label: 'Sous Branche',     width: 700,  minWidth: 500,  },
            
          ]

          if(!isEcranTraite)  return allColumns;

       
          const excludedKeys = new Set<string>()
          console.log("excludedKeys:",excludedKeys )
          if (isEcranTraite) {
          excludedKeys.add( 'assure')
        }
        // 3. Application du filtre
        if (excludedKeys.size === 0) return allColumns

        return allColumns.filter(
          (field) => !('key' in field) || !excludedKeys.has(field.key as string)
        )


} 

