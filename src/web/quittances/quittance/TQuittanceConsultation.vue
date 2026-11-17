<script setup lang="ts">

import TModal from '@/composants/display/TModal.vue';
import TToolTip from '@/composants/display/TToolTip.vue';
import TButton from '@/composants/forms/TButton.vue';
import IconeNonValider from '@/composants/icone/IconeNonValider.vue';
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import type { Acteur } from '@/services/acteurs/acteur/acteur';
import type { Campagne } from '@/services/referentiel/campagne/campagne';
import type { SousBranche } from '@/services/referentiel/sous-branche/sous-branche';
import { sousBrancheApi } from '@/services/referentiel/sous-branche/sous-branche.api';
import Acteurs from '@/web/acteurs/acteur/Acteurs.vue';
import Quittances from '@/web/quittances/quittance/Quittances.vue';
import Campagnes from '@/web/referentiel/campagne/Campagnes.vue';
import SousBranches from '@/web/referentiel/sous-branche/SousBranches.vue';
import { ref } from 'vue';
const showModalActeurCedante = ref(false)
const showModalActeurCourtier =ref(false)
const showModalExercice =ref(false)
const showModalSousBranche =ref(false)
const acteurCedante = ref<Acteur | null | undefined>(null)
const acteurCourtier = ref<Acteur | null | undefined>(null)
const sousBranche = ref<SousBranche | null | undefined>(null)  
const campagne = ref<Campagne | null | undefined>(null)


const onChoixExercice =(c : Campagne)=>{
      campagne.value=c
      showModalExercice.value=false
}
const onChoixCedante =(cedante : Acteur)=>{
      acteurCedante.value=cedante
      showModalActeurCedante.value=false
}
const onChoixCourtier =(courtier : Acteur)=>{
      acteurCourtier.value=courtier
      showModalActeurCourtier.value=false
}
const onChoixSousBranche =(b : SousBranche)=>{
      sousBranche.value=b
      showModalSousBranche.value=false
}
</script>

<template>
  <TLayoutModule
    left-size="25%"
    :show-top="false"
    :show-bottom="false"
    >
          <template #left>
                
                <div class="flex flex-col">
                      <p>Zone Filtre sur quittances</p>
                     <!-- Exercice -->
                      <TToolTip  
                       content="Cliquez pour afficher toutes quittances d'une campagne particulière...."
                       @click="showModalExercice=true" 
                       >
                            <p v-if="campagne"  class="text-primary-600  text-md uppercase pt-4
                              cursor-pointer  hover:italic dark:text-primary-400">
                               {{ campagne.libelle }}
                            </p>
                            <p v-else  class="text-primary-600  text-md uppercase pt-4
                              cursor-pointer  hover:italic dark:text-primary-400">
                              Campagnes 
                            </p>
                      </TToolTip>                  
                     

                    <div class="flex">
                              <!-- CEDANTE -->
                             <TToolTip class="pt-4"  content="Cliquez pour afficher toutes les cédantes" 
                                v-if="acteurCedante">
                                  <IconeNonValider @click="acteurCedante=undefined"></IconeNonValider>
                                  
                              </TToolTip>  
                              <TToolTip
                              content="Cliquez pour afficher toutes quittances d'une cédante particulière...."
                              @click="showModalActeurCedante=true"  
                              >
                                    <p v-if="acteurCedante"  class="text-primary-600  text-md uppercase pt-4
                                      cursor-pointer  hover:italic dark:text-primary-400">
                                     Cédante: {{ acteurCedante.raisonSociale }}
                                    </p>
                                    <p v-else  class="text-primary-600  text-md uppercase pt-4
                                      cursor-pointer  hover:italic dark:text-primary-400">Toutes les cédantes
                                    </p>
                              </TToolTip>
                              
                      </div>
                      <div class="flex">
                            <!-- COURTIERS -->
                            <TToolTip class="pt-4"  content="Cliquez pour afficher tous les courtiers" 
                                v-if="acteurCourtier">
                                  <IconeNonValider @click="acteurCourtier=undefined"></IconeNonValider>
                            </TToolTip>
                            <TToolTip class="" 
                            content="Cliquez pour afficher toutes quittances d'un courtier particulièr...."
                            @click="showModalActeurCourtier=true"  
                            >
                                  <p v-if="acteurCourtier"  class="text-primary-600  text-md uppercase pt-4
                                    cursor-pointer  hover:italic dark:text-primary-400">
                                    Courtier : {{ acteurCourtier.raisonSociale }}
                                  </p>
                                  <p v-else  class="text-primary-600  text-md uppercase pt-4
                                    cursor-pointer  hover:italic dark:text-primary-400">Tous les courtiers
                                  </p>
                            </TToolTip>
                           
                      </div>
                      <div class="flex">
                          <!-- SOUS BRANCHES -->
                          <TToolTip class="pt-4"  content="Cliquez pour afficher toutes les sous branches" 
                              v-if="sousBranche">
                                <IconeNonValider @click="sousBranche=undefined"></IconeNonValider>
                          </TToolTip> 
                          <TToolTip  
                          content="Cliquez pour afficher les quittances d'une sous branche particulière...." 
                          @click="showModalSousBranche=true"
                          >
                                <p v-if="sousBranche"  class="text-primary-600  text-md uppercase pt-4
                                  cursor-pointer  hover:italic dark:text-primary-400">
                                  {{ sousBranche.libelle }}
                                </p>
                                <p v-else  class="text-primary-600  text-md uppercase pt-4
                                  cursor-pointer  hover:italic dark:text-primary-400">Toutes les sous branches
                                </p>
                          </TToolTip>
                         
                      </div>    
                </div>
          </template>
          <template #default>
                <Quittances  />
          
          </template>


  </TLayoutModule>

  <TModal v-model="showModalActeurCedante" 
      width="70%"  
      height="65%" 
      title="Choisissez une cédante" 
   >
        <template #default>
            <Acteurs 
                :masquer-bouton-action="true" 
                @row-click="onChoixCedante"
            />
        </template>
        <template #footer>
            <TButton  variant="soft" @click="showModalActeurCedante=false">Ferner</TButton>
        </template>    

  </TModal>

  <TModal v-model="showModalActeurCourtier" 
      width="70%"  
      height="65%" 
      title="Choisissez un courtier" 
   >
        <template #default>
            <Acteurs 
                :masquer-bouton-action="true" 
                @row-click="onChoixCourtier"
            />
        </template>
        <template #footer>
            <TButton  variant="soft" @click="showModalActeurCourtier=false">Ferner</TButton>
        </template>    

  </TModal>
  <TModal v-model="showModalExercice" 
      title="Choisissez une campagne" 
   >
        <template #default>
            <Campagnes 
                :masquer-bouton-action="true" 
                @row-click="onChoixExercice"
            />
        </template>
        <template #footer>
            <TButton  variant="soft" @click="showModalExercice=false">Ferner</TButton>
        </template>    

  </TModal>
    <TModal v-model="showModalSousBranche" 
         width="70%"  
      height="65%" 
      title="Choisissez une sous branche" 
   >
        <template #default>
            <SousBranches 
                :masquer-bouton-action="true" 
                @row-click="onChoixSousBranche"
            />
        </template>
        <template #footer>
            <TButton  variant="soft" @click="showModalSousBranche=false">Ferner</TButton>
        </template>    

  </TModal>
</template>