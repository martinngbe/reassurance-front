
import type { Police } from "@/services/polices/police/police";
import type { Devise } from "@/services/referentiel/devise/devise";
import type { Mouvement } from "@/services/referentiel/mouvement/mouvement";
import type { Pays } from "@/services/referentiel/pays/pays";
import type { BaseEntity } from "@/type/base-entity";
import type { QuittancePlacement } from "../quittance-placement/quittance-placement";
import type { NatureOffre } from "@/services/referentiel/nature-offre/nanture-offre";
import type { TableColumn } from "@/composants/forms/common";
import type { FormField } from "@/composants/forms/generic-form/types-form";

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
  nombreTranche: number;
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
  portee: number;
  priorite: number;
 
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


export function quittanceAllColumns(natureOffre:NatureOffre | undefined ){

        
          const allColumns: TableColumn[] = [
                          { key: 'police', label: 'Cedante',     width: 150,  minWidth: 100, },
                          { key: 'mouvement',    label: 'Mvt',          width: 20,   minWidth: 80 },    
                          { key: 'numero',       label: 'N°Quittance',  width: 200,   minWidth: 80 , resizable:true},
                          { key: 'isCession',    label: 'Cess°',        width: 50,   minWidth: 80,  align: 'center' },
                          { key: 'isIard',       label: 'IARD',         width: 50,   minWidth: 80,  align: 'center' },
                        
                          { key: 'isSinistree',  label: 'Sinistrée',    width: 50,   minWidth: 80,  align: 'center' },
                          { key: 'dateEffet',    label: 'Date Effet',   width: 200,  minWidth: 200, align: 'center' },
                          { key: 'dateEcheance', label: 'Date Echéance',width: 200,  minWidth: 200,  align: 'center' },
                          { key: 'devise',       label: 'Devise',       width: 80,   minWidth: 80,   align:'center'},
                          { key: 'coursDevise',  label: 'Cours Devise', width: 150,  minWidth: 80,  align:'right' },
                        
                          { key: 'capitaux',     label: 'Capitaux',     width: 200,  minWidth: 200, align:'right'  },
                          { key: 'lci',          label: 'LCI',          width: 200,  minWidth: 200,  align:'right' },
                          { key: 'smp',          label: 'SMP',          width: 200,  minWidth: 200,  align:'right' },
                          { key: 'limite',       label: 'Limite',       width: 200,  minWidth: 200,  align:'right' },
                          { key: 'retention',    label: 'Retention',    width: 200,  minWidth: 200,  align:'right' },
                          { key: 'conservation',      label: 'Conservation',  width: 200,  minWidth: 200,  align:'right' },
                          { key: 'priorite',          label: 'Priorité',      width: 200,  minWidth: 200,  align:'right' },
                          { key: 'portee',            label: 'Portee',        width: 200,  minWidth: 200,  align:'right' },
                        
                          { key: 'nombreTranche',    label: 'Nb. Tranche',   width: 200,  minWidth: 200,  align:'center' },
                        
                          { key: 'nombreEcheancePmd',    label: 'Nb. Echéeance PMD',   width: 200,  minWidth: 200,  align:'center' },
                          { key: 'sinistreAuComptant',   label: 'Sinistre Au Comptant',width: 200,  minWidth: 200,  align:'right' },
                          
                          { key: 'primeBrute',    label: 'Prime Brute',         width: 200,  minWidth: 200,  align:'right' },
                          { key: 'primeCedee',    label: 'Prime Cédée',         width: 200,  minWidth: 200,  align:'right' },
                          { key: 'primeAcceptee', label: 'Prime Acceptée',      width: 200,  minWidth: 200,  align:'right' },

                          { key: 'primeNette',          label: 'Prime Nette',         width: 200,  minWidth: 200,  align:'right' },
                          { key: 'estimationPrime',     label: 'Estimation Prime',    width: 200,  minWidth: 200,  align:'right' },

                          { key: 'taxeSurPrime',        label: 'Taxe sur Prime',  width: 200,  minWidth: 200,  align:'right' }, 
                          { key: 'tauxCedante',         label: 'Taux Cédante',    width: 200,  minWidth: 200,  align:'right' },  
                          { key: 'tauxAccepte',         label: 'Taux Accepté',    width: 200,  minWidth: 200,  align:'right' },
                          
                          { key: 'tauxCommission',       label: 'Taux Cie',        width: 200,  minWidth: 200,  align:'right' },
                          { key: 'taxeSurCommission',    label: 'Taxe sur Cie',    width: 200,  minWidth: 200,  align:'right' },
                        
                        ]

          if(!natureOffre)  return allColumns;

          console.warn("---- QUITTANCES allColumns:",allColumns )
          const isEdp =natureOffre?.isEdp   
          const isFacultative =natureOffre?.isFacultative
          const isFacObligatoire =natureOffre?.isFacObligatoire
          const isQuotePart =natureOffre?.isQuotePart
          const isXs =natureOffre?.isXs

          const excludedKeys = new Set<string>()
          console.log("excludedKeys:",excludedKeys )
          if (isEdp || isFacObligatoire || isQuotePart) {
          // OFFRE EDP : retirer les champs Non-Proportionnelle
          console.log('---- OFFRE EDP isEdp :',isEdp)
          excludedKeys.add( 'capitaux')
          excludedKeys.add( 'lci')
          excludedKeys.add( 'smp')
          excludedKeys.add( 'limite')  
          excludedKeys.add( 'retention')
          excludedKeys.add( 'capacite')
          
          excludedKeys.add('estimationPrime')
          excludedKeys.add('primeBrute')
        } if(isFacObligatoire || isFacultative || isQuotePart) {
          //console.log('---- OFFRE FACOB  QP  isFacObligatoire :',isFacObligatoire)
          //console.log('---- OFFRE FACOB  QP  isQuotePart :',isQuotePart)
          //excludedKeys.add( 'capitaux'),
          //excludedKeys.add( 'lci'),
          //excludedKeys.add( 'smp'),
          excludedKeys.add( 'limite'),  
          excludedKeys.add( 'retention') 
          excludedKeys.add( 'conservation')
          excludedKeys.add( 'portee')
          excludedKeys.add( 'priorite')

          excludedKeys.add( 'nombreTranche')
          excludedKeys.add( 'nombreEcheancePmd')
          excludedKeys.add( 'estimationPrime')
          excludedKeys.add( 'taxeSurPrime')
        } if (isXs){
          console.log('---- OFFRE XS isXs :',isXs)
          excludedKeys.add( 'capitaux'),
          excludedKeys.add( 'lci'),
          excludedKeys.add( 'smp'),
          excludedKeys.add( 'limite')//,  
          excludedKeys.add( 'retention'),
          excludedKeys.add( 'conservation'),
          excludedKeys.add( 'capacite') 
          excludedKeys.add( 'aliment') 

          excludedKeys.add( 'primeBrute')
          excludedKeys.add( 'primeCedee')
          excludedKeys.add( 'primeNette')
          excludedKeys.add( 'primeAcceptee')

          excludedKeys.add( 'taxeSurPrime')
          excludedKeys.add( 'tauxCedante')  
          excludedKeys.add( 'tauxAccepte')
          
          excludedKeys.add( 'tauxCommission')
          excludedKeys.add( 'taxeSurCommission')
          
          
        }
        // 3. Application du filtre
        if (excludedKeys.size === 0) return allColumns

        return allColumns.filter(
          (field) => !('key' in field) || !excludedKeys.has(field.key as string)
        )


} 


const createNumberField = (key: string, label: string): FormField => ({
  key,
  label,
  type: 'number',
  size: 'xl',
  helpText: `${label} à 100%`,
  numberOptions: {
    decimals: 2,
    formatOptions: { style: 'decimal' },
    returnType: 'number',
    min: 0,        // 👈 Prix minimum = 0
    max: 999999999999999.99, // 👈 Prix maximum
  },
})
export function quittanceCapitauxFields(natureOffre: NatureOffre | undefined){
      
        const allFields: FormField[] = [
        
          { section: 'Capitaux' },
          createNumberField( 'capitaux', 'Capitaux'),
          createNumberField( 'lci',  'LCI'),
          createNumberField( 'smp',  'SMP'),
          createNumberField( 'limite',  'Limite'),
          createNumberField( 'aliment',  'Aliment'),
        
          createNumberField( 'retention',  'Retention'),
          createNumberField( 'conservation',  'Conservation'),
          createNumberField( 'capacite',  'Capacité'),
          createNumberField( 'priorite',  'Priorité'),
          createNumberField( 'portee',  'Portée'),
        ]

        const isEdp =natureOffre?.isEdp   
        const isFacultative =natureOffre?.isFacultative
        const isFacObligatoire =natureOffre?.isFacObligatoire
        const isQuotePart =natureOffre?.isQuotePart
        const isXs =natureOffre?.isXs

        const excludedKeys = new Set<string>()
        if (isEdp) {
          // OFFRE EDP : retirer les champs Non-Proportionnelle
          console.log('---- OFFRE EDP isEdp :',isEdp)
          excludedKeys.add( 'capitaux')
          excludedKeys.add( 'lci')
          excludedKeys.add( 'smp')
          excludedKeys.add( 'limite') 
          excludedKeys.add( 'retention')
          excludedKeys.add( 'capacite') 
            
        }
      if(isFacObligatoire || isFacultative || isQuotePart) {
          //excludedKeys.add( 'capitaux'),
          //excludedKeys.add( 'lci'),
          //excludedKeys.add( 'smp'),
          excludedKeys.add( 'capacite')
          excludedKeys.add( 'limite'),  
          excludedKeys.add( 'retention') 
          excludedKeys.add( 'conservation')
          excludedKeys.add( 'portee') 
          excludedKeys.add( 'priorite')
          excludedKeys.add( 'aliment')
        }
        if (isXs  ){
          console.log('---- OFFRE XS isXs :',isXs)
          excludedKeys.add( 'capitaux'),
          excludedKeys.add( 'lci'),
          excludedKeys.add( 'smp'),
          excludedKeys.add( 'limite')//,  
          excludedKeys.add( 'retention'),
          excludedKeys.add( 'conservation'),
          excludedKeys.add( 'capacite') 
          excludedKeys.add( 'aliment') 
           excludedKeys.add( 'nombrePlein') 
          
        }

        console.log('excludedKeys:', excludedKeys.values)

        // 3. Application du filtre
        if (excludedKeys.size === 0) return allFields

        return allFields.filter(
          (field) => !('key' in field) || !excludedKeys.has(field.key as string)
        )
    

}

export function quittanceEmissionFields(
  natureOffre: NatureOffre | undefined ,
  fetchDevise : any | null ){
            const allFields: FormField[] = [
              { section: 'Dévise et Période de couverture' },
              {
                key: 'deviseId',
                label: 'Devise',
                type: 'async-select',
                required: true,
                size:'xl',                
                ...(fetchDevise && { placeholder: 'Sélectionner une devise ...' }),
                ...(fetchDevise && { loadOptions: fetchDevise }),
                autoSelectFirst: true,
                asyncOptions: { trackBy: 'id', labelBy: 'libelle' }
              },
              { key: 'coursDevise', label: 'Cours devise', type: 'number', required: true },
              { key: 'dateEffet', label: 'Date Effet', type: 'calendar' },  
              { key: 'dateEcheance', label: 'Date Echéance', type: 'calendar' },
            
              { section: 'Autres informations' },
              { key: 'nombrePlein', label: 'Nombre Plein', type: 'number' },
              { key: 'nombreEcheancePmd', label: 'Nb.échéance PMD', type: 'number' },     
              { key: 'nombreTranche', label: 'Nb. Tranche', type: 'number' },     
            
              { key: 'avisEcheance', label: 'Avis Echéance', type: 'number', helpText: "Délais (jours) de notification avant échéance" },  
            
              { key: 'sinistreAuComptant', label: 'Sinistre au Comptant', type: 'number', helpText: 'Montant min à payer sans attendre' }, 
              { key: 'avisSinistre', label: 'Avis sinistre', type: 'number', helpText: 'Délais (jours) de notification du sinistre' }
            
            ];
            const isEdp =natureOffre?.isEdp   
            const isFacultative =natureOffre?.isFacultative
            const isFacObligatoire =natureOffre?.isFacObligatoire
            const isQuotePart =natureOffre?.isQuotePart
            const isXs =natureOffre?.isXs

            console.log('_____ natureOffre:', natureOffre)
            const excludedKeys = new Set<string>()
            if(isEdp ||  isFacultative)  {
              excludedKeys.add('nombreEcheancePmd')
            //  excludedKeys.add('nombreEcheancePmd')
            }
            if(isFacObligatoire || isFacultative||  isQuotePart){
              excludedKeys.add('nombreEcheancePmd')
              excludedKeys.add('nombrePlein')
              excludedKeys.add('nombreEchancePmd')
              excludedKeys.add('nombreTranche')
            }
            if(isXs || isFacultative){
              excludedKeys.add('nombrePlein')
            }
          
            // 3. Application du filtre
            if (excludedKeys.size === 0) return allFields

            return allFields.filter(
              (field) => !('key' in field) || !excludedKeys.has(field.key as string)
            )   

}

export function quittancePrimesFields(natureOffre:NatureOffre | undefined){
        const allFields: FormField[] = [ 
        
          { section: 'Primes' },
          { key: 'primeBrute', label: 'Prime brute', type: 'number', numberOptions: { min: 0 } , helpText:'Prime à100%' },
          { key: 'estimationPrime', label: 'Estimation prime', type: 'number', numberOptions: { min: 0 } , helpText:'Prime à100%'},   
        ]


        const isEdp =natureOffre?.isEdp   
        const isFacultative =natureOffre?.isFacultative
        const isFacObligatoire =natureOffre?.isFacObligatoire
        const isQuotePart =natureOffre?.isQuotePart
        const isXs =natureOffre?.isXs
        const excludedKeys = new Set<string>()
        if (isEdp || isFacObligatoire || isFacultative || isQuotePart) {
          // OFFRE PROPORTIONNELLE : retirer les champs Non-Proportionnelle
          excludedKeys.add('estimationPrime')
          //excludedKeys.add('primeBrute')
        
        } if(isXs){
          excludedKeys.add('primeBrute')
          
        }

        // Le deux champs primes ont été rétirée
        // donc on retourne un tableau vide
        if(excludedKeys.size===2) return [] 
        // 3. Application du filtre
        if (excludedKeys.size === 0) return allFields

        return allFields.filter(
          (field) => !('key' in field) || !excludedKeys.has(field.key as string)
        )
     
}

export function quittanceTauxEtTaxesFields(natureOffre:NatureOffre | undefined){
          const allFields: FormField[] = [

            { section: 'Taux et Taxes' },
            createNumberField( 'tauxCedante', 'Taux Cédante'  ),
            createNumberField( 'tauxAccepte', 'Taux Accepté'  ),
            createNumberField( 'tauxCession', 'Taux Cession' ),
            createNumberField( 'tauxRetention', 'Taux Retention' ),
            createNumberField( 'tauxCommission', 'Taux commission' ),
            createNumberField( 'taxeSurPrime', 'Taxe sur prime' ),
            createNumberField( 'taxeSurCommission', 'Taxe sur commission' ),

          ]

          const isEdp =natureOffre?.isEdp   
          const isFacultative =natureOffre?.isFacultative
          const isFacObligatoire =natureOffre?.isFacObligatoire
          const isQuotePart =natureOffre?.isQuotePart
          const isXs =natureOffre?.isXs
          const excludedKeys = new Set<string>()
          if(isEdp){
            excludedKeys.add( 'tauxCedante')
            excludedKeys.add( 'tauxAccepte')
            excludedKeys.add( 'tauxCession' )
            excludedKeys.add( 'tauxRetention' )    
            excludedKeys.add( 'tauxCommission' )
            excludedKeys.add( 'taxeSurPrime' )
            excludedKeys.add( 'taxeSurCommission' )

          } if(isFacObligatoire || isFacultative){
            excludedKeys.add( 'tauxCession' )
            excludedKeys.add( 'tauxRetention' )    
            excludedKeys.add( 'tauxCommission' )
            excludedKeys.add( 'taxeSurPrime' )
            excludedKeys.add( 'taxeSurCommission' )  
          } if(isQuotePart){
            excludedKeys.add( 'tauxCedante')
            excludedKeys.add( 'tauxAccepte')
            //excludedKeys.add( 'tauxCession' )
            //excludedKeys.add( 'tauxRetention' )    
            excludedKeys.add( 'tauxCommission' )
            excludedKeys.add( 'taxeSurPrime' )
            excludedKeys.add( 'taxeSurCommission' )  
          }
          if(isXs){
            excludedKeys.add( 'tauxCedante')
            excludedKeys.add( 'tauxAccepte')
            excludedKeys.add( 'tauxCession' )
            excludedKeys.add( 'tauxRetention' )    
            excludedKeys.add( 'tauxCommission' )
            excludedKeys.add( 'taxeSurPrime' )
            excludedKeys.add( 'taxeSurCommission' )  
          }

          // Le les champs  ont été rétirée
          // donc on retourne un tableau vide
          if(excludedKeys.size===7) return [] 
          // 3. Application du filtre
          if (excludedKeys.size === 0) return allFields

          return allFields.filter(
            (field) => !('key' in field) || !excludedKeys.has(field.key as string)
          )


}