<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FormField } from '@/composants/forms/generic-form/types-form'
import TTitreSousModule from '@/composants/utilitaire/TTitreSousModule.vue'

import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store'

import type { PaginationParams } from '@/type/pagination'
import { useQuittanceTrancheStore } from '@/services/quittances/quittance-tranche/quittance-tranche.store'
import type { CreateQuittanceTrancheDto, QuittanceTranche, QuittanceTrancheFormData, UpdateQuittanceTrancheDto } from '@/services/quittances/quittance-tranche/quittance-tranche'
import { useQuittanceTranches } from '@/services/quittances/quittance-tranche/useQuittanceTranche'

const quittanceStore = useQuittanceStore()
const currentQuittance = computed(()=> quittanceStore.currentQuittance)
// id de la quittance en cours
const currentQuittanceId =  currentQuittance.value?  
        currentQuittance.value.id : null
const quittanceTrancheStore = useQuittanceTrancheStore()
// // ✅ AJOUT : refs réactives pour le composable
// const trancheEnEditionRef = computed(() => props.quittanceTranche ?? null)

// // ✅ AJOUT : composable de cumul des taux
// const quittanceIdRef = computed(() => currentQuittance.value?.id ?? null)

// // ✅ AJOUT : état du taux saisi en temps réel
// const tauxSaisi = computed<number>(
//   () => Number(formData.value?.tauxPrime) || 0,
// )




// cette propriété doit venir obligatoirement 
// avec au minimum quittanceId  implémenté si Erreur
// à editer
const props = defineProps<{
  quittanceTranche?:  QuittanceTranche | null
}>()


const emit = defineEmits<{
  success: [message: string]
  cancel: []
  deleted: [id: number]
}>()

//const store = useQuittanceTrancheStore()

// const currentTranche = computed<QuittanceTranche | null>(
//   () => currentQuittance.value ?? store.currentQuittanceTranche,
// )

const isEditing = computed(() => !!props.quittanceTranche)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))


const quittanceId =  props.quittanceTranche?
props.quittanceTranche.quittanceId :
currentQuittanceId

const params = computed<PaginationParams>(() => ({}))
const { createQuittanceTranche, updateQuittanceTranche, deleteQuittanceTranche } =
  useQuittanceTranches(quittanceId, params)

const loading = computed(() =>
  createQuittanceTranche.isPending.value ||
  updateQuittanceTranche.isPending.value ||
  deleteQuittanceTranche.isPending.value,
)
const errorMessage = ref<string | null>(null)


// ==================== CHAMPS ====================
const pourcentageNumberOption = {
 min: 0, max: 100 , decimals:3 
}
const quittanceTrancheFields = computed<FormField[]>(() => {
  // ✅ Options dynamiques pour tauxCession selon le disponible
  const tauxTrancheOptions = {
    min: 0,
    max: 100,
    decimals: 3,
  }

  const fields: FormField[] = [
    {
      key: 'numeroTranche',
      label: 'N°Tranche',
      type: 'number',
     // numberOptions: pourcentageNumberOption,
     // helpText: 'De 0 à 100 %',
    },
    {
      key: 'tauxPrime',
      label: 'Taux de prime (%)',
      type: 'number',
      numberOptions: pourcentageNumberOption,
      helpText: 'De 0 à 100 %',
    },
   
  ]

  return fields
})

// ==================== MAPPING ENTITÉ <-> FORMULAIRE ====================

function initializeFormData(): QuittanceTrancheFormData {
  // ✅ Vérifier la prop de l'entité plutôt que le store parent
  console.log(" -- TQuittanceTrancheForm.initializeFormData -- ")
  console.log(" props.quittanceTranche: ",props.quittanceTranche)
  if (!props.quittanceTranche) { 
    return Object.fromEntries(
      quittanceTrancheFields.value
        .filter((f) => 'key' in f)
        .map((f) => [f.key, f.type === 'checkbox' ? true : ''])
    ) as unknown as QuittanceTrancheFormData
  }

  const data = { ...props.quittanceTranche } as QuittanceTrancheFormData

  // ✅ Mapper les objets COMPLETS vers les clés attendues par le formulaire

  if (data.quittance) {
    data.quittanceId = data.quittance
    delete data.quittance
  } 
 
  if (data.quittanceTrancheAnnule) {
    data.quittanceTrancheIdAnnule = data.quittanceTrancheAnnule
    delete data.quittanceTrancheAnnule
  } 

  return data as QuittanceTrancheFormData
}

const formData = ref<QuittanceTrancheFormData>(initializeFormData())

/**
 * ⭐ On surveille l'ID (et non l'objet en deep) :
 *  - pas de reset pendant la saisie / mise à jour optimiste
 *  - null -> on repasse bien en mode création
 */
watch(
  () => props.quittanceTranche ?? null,
  () => { errorMessage.value = null; formData.value = initializeFormData() },
  { immediate: true },
)

// ==================== PAYLOAD ====================
function extractId(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'object') return (value as any).id ?? null
  const n = Number(value)
  return Number.isNaN(n) ? null : n
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isNaN(n) ? null : n
}

function buildPayload(data: Record<string, any>): UpdateQuittanceTrancheDto {
   const quittanceId = extractId(data.quittanceId) ?? 
       currentQuittanceId
   const portee = currentQuittance.value? currentQuittance.value.portee  : 0  
   const priorite = currentQuittance.value? currentQuittance.value.priorite  : 0
   const estimationPrime = currentQuittance.value? currentQuittance.value.estimationPrime  : 0
  return {
    quittanceId,
    portee,
    priorite,
    estimationPrime,
    numeroTranche: toNumber(data.numeroTranche)?? 1,
    tauxPrime: toNumber(data.tauxPrime)?? 0,
    tauxCommission: toNumber(data.tauxCommission)?? 0,
    taxeSurCommission: toNumber(data.taxeSurCommission)?? 0,
   
    quittanceTrancheIdAnnule: extractId(data.quittanceTrancheIdAnnule),
  } as UpdateQuittanceTrancheDto
}

const handleSubmit = async (data: Record<string, any>) => {
                errorMessage.value = null
                const payload = buildPayload(data)

                if (!payload.quittanceId) {
                  errorMessage.value = 'Quittance manquante : impossible d’enregistrer le tranche.'
                  return
                }

                try {
                  if (isEditing.value && props.quittanceTranche) {
                    const res = await updateQuittanceTranche.mutateAsync({
                      id: props.quittanceTranche.id,
                      data: payload,
                    })
                    if (res) quittanceTrancheStore.selectQuittanceTranche(res)
                   
                    emit('success', 'Tranche modifié avec succès')
                  } else {
                    const res = await createQuittanceTranche.mutateAsync(payload as CreateQuittanceTrancheDto)
                    if (res) quittanceTrancheStore.selectQuittanceTranche(res)
                  
                    emit('success', 'Tranche créé avec succès')
                  }
                } catch (err: any) {
                  console.error('Erreur sauvegarde tranche :', err)
                  const msg = err?.response?.data?.message
                  errorMessage.value = Array.isArray(msg) ? msg.join(' • ') : msg || err?.message || 'Erreur lors de la sauvegarde.'
                }
}
const handleDelete = async () => {
  const id = props.quittanceTranche? props.quittanceTranche.id : null
  if (!id) return
  if (!confirm('Supprimer définitivement ce tranche ?')) return
  try {
    await deleteQuittanceTranche.mutateAsync(id)
    emit('deleted', id)
    emit('success', 'Tranche supprimé avec succès')
  } catch (err: any) {
    errorMessage.value = err?.response?.data?.message || 'Erreur lors de la suppression.'
  }
}

const handleCancel = () => { errorMessage.value = null; emit('cancel') }
</script>

<template>
    <div class="flex flex-col m-4">
          <TTitreSousModule :libelle="isEditing ? 'Modification du tranche' : 'Nouvelle tranche'" />     
          


          <!-- Erreur générale -->
          <div
            v-if="errorMessage"
            class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            {{ errorMessage }}
          </div>

          <GenericCrudForm
            v-model="formData"
            :fields="quittanceTrancheFields"
            :mode="formMode"
            :loading="loading"
            :columns="2"
            :submit-label="isEditing ? 'Mettre à jour' : 'Créer'"
            @submit="handleSubmit"
            @cancel="handleCancel"
            @delete="handleDelete"
          />
    </div>      
</template>