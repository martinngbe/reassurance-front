<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FormField } from '@/composants/forms/generic-form/types-form'
import TTitreSousModule from '@/composants/utilitaire/TTitreSousModule.vue'
import { apiClient } from '@/api/api-client'
import { useQuittancePlacementStore } from '@/services/quittances/quittance-placement/quittance-placement.store'
import { useQuittancePlacements } from '@/services/quittances/quittance-placement/useQuittancePlacement'
import type {
  QuittancePlacement,
  QuittancePlacementFormData,
  CreateQuittancePlacementDto,
  UpdateQuittancePlacementDto,
} from '@/services/quittances/quittance-placement/quittance-placement'
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store'

import type { PaginationParams } from '@/type/pagination'
import { useCumulTauxCession } from '@/services/quittances/quittance-placement/useCumulTauxCession'

const quittanceStore = useQuittanceStore()
const currentQuittance = computed(()=> quittanceStore.currentQuittance)
// id de la quittance en cours
const currentQuittanceId =  currentQuittance.value?  
        currentQuittance.value.id : null
const quittancePlacementStore = useQuittancePlacementStore()
// ✅ AJOUT : refs réactives pour le composable
const placementEnEditionRef = computed(() => props.quittancePlacement ?? null)

// ✅ AJOUT : composable de cumul des taux
const quittanceIdRef = computed(() => currentQuittance.value?.id ?? null)
const {
  tauxAccepte,
  cumulTauxCession,
  tauxDisponible,
  isCumulDepasse,
  nombrePlacementsActifs,
  verifierDepassement,
   fetchCumulTaux,
} = useCumulTauxCession(quittanceIdRef)

// ✅ AJOUT : état du taux saisi en temps réel
const tauxSaisi = computed<number>(
  () => Number(formData.value?.tauxCession) || 0,
)

// ✅ AJOUT : info de dépassement en temps réel
const infoDepassement = computed(() => verifierDepassement(tauxSaisi.value))

// ✅ AJOUT : max autorisé pour le champ tauxCession
const maxTauxCessionAutorise = computed<number>(() => tauxDisponible.value)





// cette propriété doit venir obligatoirement 
// avec au minimum quittanceId  implémenté si Erreur
const props = defineProps<{
  quittancePlacement?:  QuittancePlacement | null
}>()


const emit = defineEmits<{
  success: [message: string]
  cancel: []
  deleted: [id: number]
}>()

//const store = useQuittancePlacementStore()

// const currentPlacement = computed<QuittancePlacement | null>(
//   () => currentQuittance.value ?? store.currentQuittancePlacement,
// )

const isEditing = computed(() => !!props.quittancePlacement)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))


const quittanceId =  props.quittancePlacement?
props.quittancePlacement.quittanceId :
currentQuittanceId

const params = computed<PaginationParams>(() => ({}))
const { createQuittancePlacement, updateQuittancePlacement, deleteQuittancePlacement } =
  useQuittancePlacements(quittanceId, params)

const loading = computed(() =>
  createQuittancePlacement.isPending.value ||
  updateQuittancePlacement.isPending.value ||
  deleteQuittancePlacement.isPending.value,
)
const errorMessage = ref<string | null>(null)

// ==================== FETCH ASYNC ====================
function makeFetcher(url: string) {
  return async (query: string, page: number) => {
    const res = await apiClient.get(url, { params: { search: query, page, limit: 20 } })
    return {
      options: res.data.items ?? res.data.data ?? [],
      hasMore: (res.data.meta?.current_page ?? 1) < (res.data.meta?.last_page ?? 1),
    }
  }
}
const fetchActeur = makeFetcher('/acteur')
const fetchNaturePlacement = makeFetcher('/nature-placement')

// ==================== CHAMPS ====================
const pourcentageNumberOption = {
 min: 0, max: 100 , decimals:2 
}
const quittancePlacementFields = computed<FormField[]>(() => {
  // ✅ Options dynamiques pour tauxCession selon le disponible
  const tauxCessionOptions = {
    min: 0,
    max: maxTauxCessionAutorise.value,
    decimals: 2,
  }

  const fields: FormField[] = [
    { section: 'Acteur et nature du placement' },
    {
      key: 'acteurId',
      label: 'Acteur',
      type: 'async-select',
      required: true,
      placeholder: 'Sélectionner un acteur…',
      loadOptions: fetchActeur,
      autoSelectFirst: !isEditing.value,
      asyncOptions: { trackBy: 'id', labelBy: 'raisonSociale' },
    },
    {
      key: 'naturePlacementId',
      label: 'Nature du placement',
      type: 'async-select',
      required: true,
      placeholder: 'Sélectionner la nature du placement…',
      loadOptions: fetchNaturePlacement,
      autoSelectFirst: !isEditing.value,
      asyncOptions: { trackBy: 'id', labelBy: 'libelle' },
    },

    { section: 'Taux et taxes' },
    {
      key: 'tauxCession',
      label: 'Taux de cession (%)',
      type: 'number',
      required: true,
      numberOptions: tauxCessionOptions, // ✅ max dynamique
      helpText: `Disponible : ${tauxDisponible.value.toFixed(2)}% sur ${tauxAccepte.value.toFixed(2)}%`,
    },
    {
      key: 'tauxCommission',
      label: 'Taux de commission (%)',
      type: 'number',
      numberOptions: pourcentageNumberOption,
      helpText: 'De 0 à 100 %',
    },
    {
      key: 'commissionFixe',
      label: 'Commission fixe',
      type: 'number',
      numberOptions: { min: 0, decimals: 2 },
    },
  ]

  return fields
})

// ==================== MAPPING ENTITÉ <-> FORMULAIRE ====================

function initializeFormData(): QuittancePlacementFormData {
  // ✅ Vérifier la prop de l'entité plutôt que le store parent
  console.log(" -- TQuittancePlacementForm.initializeFormData -- ")
  console.log(" props.quittancePlacement: ",props.quittancePlacement)
  if (!props.quittancePlacement) { 
    return Object.fromEntries(
      quittancePlacementFields.value
        .filter((f) => 'key' in f)
        .map((f) => [f.key, f.type === 'checkbox' ? true : ''])
    ) as unknown as QuittancePlacementFormData
  }

  const data = { ...props.quittancePlacement } as QuittancePlacementFormData

  // ✅ Mapper les objets COMPLETS vers les clés attendues par le formulaire
  if (data.naturePlacement) {
    data.naturePlacementId = data.naturePlacement
    delete data.naturePlacement
  }
  if (data.quittance) {
    data.quittanceId = data.quittance
    delete data.quittance
  } 
  if (data.acteur) {
    data.acteurId = data.acteur
    delete data.acteur
  } 
  if (data.quittancePlacementAnnule) {
    data.quittancePlacementIdAnnule = data.quittancePlacementAnnule
    delete data.quittancePlacementAnnule
  } 

  return data as QuittancePlacementFormData
}

const formData = ref<QuittancePlacementFormData>(initializeFormData())

/**
 * ⭐ On surveille l'ID (et non l'objet en deep) :
 *  - pas de reset pendant la saisie / mise à jour optimiste
 *  - null -> on repasse bien en mode création
 */
watch(
  () => props.quittancePlacement ?? null,
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

function buildPayload(data: Record<string, any>): UpdateQuittancePlacementDto {
   const quittanceId = extractId(data.quittanceId) ?? 
       currentQuittanceId
   const primeBrute = currentQuittance.value? currentQuittance.value.primeBrute  : 0  

  return {
    quittanceId,
    primeBrute,
    tauxCession: toNumber(data.tauxCession)?? 0,
    tauxCommission: toNumber(data.tauxCommission)?? 0,
    commissionFixe: toNumber(data.commissionFixe)?? 0,
   
    acteurId: extractId(data.acteurId),
    naturePlacementId: extractId(data.naturePlacementId),
    //quittanceId: extractId(data.quittanceId),
    quittancePlacementIdAnnule: extractId(data.quittancePlacementIdAnnule),
  } as UpdateQuittancePlacementDto
}

// ==================== HANDLERS ====================
/*
const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
  const payload = buildPayload(data)

  if (!payload.quittanceId) {
    errorMessage.value = 'Quittance manquante : impossible d’enregistrer le placement.'
    return
  }
  if (!payload.acteurId || !payload.naturePlacementId) {
    errorMessage.value = 'Acteur et nature du placement sont obligatoires.'
    return
  }

  try {
    if (isEditing.value && props.quittancePlacement) {
      const res = await updateQuittancePlacement.mutateAsync({ id: props.quittancePlacement.id, data: payload })
      if (res) quittancePlacementStore.selectQuittancePlacement(res)
      emit('success', 'Placement modifié avec succès')
    } else {
      const res = await createQuittancePlacement.mutateAsync(payload as CreateQuittancePlacementDto)
      if (res) quittancePlacementStore.selectQuittancePlacement(res)
      emit('success', 'Placement créé avec succès')
    }
  } catch (err: any) {
    console.error('Erreur sauvegarde placement :', err)
    const msg = err?.response?.data?.message
    errorMessage.value = Array.isArray(msg) ? msg.join(' • ') : msg || err?.message || 'Erreur lors de la sauvegarde.'
  }
}
*/
const handleSubmit = async (data: Record<string, any>) => {
                errorMessage.value = null
                const payload = buildPayload(data)

                if (!payload.quittanceId) {
                  errorMessage.value = 'Quittance manquante : impossible d’enregistrer le placement.'
                  return
                }
                if (!payload.acteurId || !payload.naturePlacementId) {
                  errorMessage.value = 'Acteur et nature du placement sont obligatoires.'
                  return
                }

                // ✅ AJOUT : garde-fou front avant envoi
                const { depasse, nouveauCumul } = verifierDepassement(payload.tauxCession)
                if (depasse) {
                  errorMessage.value =
                    `Le cumul des taux de cession (${nouveauCumul.toFixed(2)}%) ` +
                    `dépasse le taux accepté (${tauxAccepte.value.toFixed(2)}%). ` +
                    `Veuillez réduire le taux.`
                  return
                }

                try {
                  if (isEditing.value && props.quittancePlacement) {
                    const res = await updateQuittancePlacement.mutateAsync({
                      id: props.quittancePlacement.id,
                      data: payload,
                    })
                    if (res) quittancePlacementStore.selectQuittancePlacement(res)
                    await fetchCumulTaux() // ← ✅ ACTUALISATION APRÈS UPDATE
                    emit('success', 'Placement modifié avec succès')
                  } else {
                    const res = await createQuittancePlacement.mutateAsync(payload as CreateQuittancePlacementDto)
                    if (res) quittancePlacementStore.selectQuittancePlacement(res)
                    await fetchCumulTaux() // ← ✅ ACTUALISATION APRÈS CREATE
                    emit('success', 'Placement créé avec succès')
                  }
                } catch (err: any) {
                  console.error('Erreur sauvegarde placement :', err)
                  const msg = err?.response?.data?.message
                  errorMessage.value = Array.isArray(msg) ? msg.join(' • ') : msg || err?.message || 'Erreur lors de la sauvegarde.'
                }
}
const handleDelete = async () => {
  const id = props.quittancePlacement? props.quittancePlacement.id : null
  if (!id) return
  if (!confirm('Supprimer définitivement ce placement ?')) return
  try {
    await deleteQuittancePlacement.mutateAsync(id)
    emit('deleted', id)
    emit('success', 'Placement supprimé avec succès')
  } catch (err: any) {
    errorMessage.value = err?.response?.data?.message || 'Erreur lors de la suppression.'
  }
}

const handleCancel = () => { errorMessage.value = null; emit('cancel') }
</script>

<template>
  <div class="flex flex-col">
    <TTitreSousModule :libelle="isEditing ? 'Modification du placement' : 'Nouveau placement'" />

    <!-- ✅ AJOUT : Bandeau récapitulatif du cumul -->
    <div
      class="mb-4 grid grid-cols-3 gap-4 rounded-lg border px-4 py-3 text-sm"
      :class="
        isCumulDepasse
          ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300'
          : 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300'
      "
    >
      <div>
        <div class="text-xs opacity-75">Cumul actuel</div>
        <div class="text-lg font-semibold">{{ cumulTauxCession.toFixed(2) }}%</div>
      </div>
      <div>
        <div class="text-xs opacity-75">Taux accepté</div>
        <div class="text-lg font-semibold">{{ tauxAccepte.toFixed(2) }}%</div>
      </div>
      <div>
        <div class="text-xs opacity-75">Disponible</div>
        <div class="text-lg font-semibold">{{ tauxDisponible.toFixed(2) }}%</div>
      </div>
    </div>

    <!-- ✅ AJOUT : Alerte si dépassement -->
    <div
      v-if="infoDepassement.depasse && tauxSaisi > 0"
      class="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
    >
      ⚠️ Le taux saisi ferait dépasser le taux accepté de
      <strong>{{ infoDepassement.depassement.toFixed(2) }}%</strong>
      (nouveau cumul : {{ infoDepassement.nouveauCumul.toFixed(2) }}%).
    </div>

    <!-- Erreur générale -->
    <div
      v-if="errorMessage"
      class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
    >
      {{ errorMessage }}
    </div>

    <GenericCrudForm
      v-model="formData"
      :fields="quittancePlacementFields"
      :mode="formMode"
      :loading="loading"
      :columns="1"
      :submit-label="isEditing ? 'Mettre à jour' : 'Créer'"
      @submit="handleSubmit"
      @cancel="handleCancel"
      @delete="handleDelete"
    />
  </div>
</template>