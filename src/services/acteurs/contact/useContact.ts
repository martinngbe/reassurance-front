// /referentiel/contact/useContact.ts
import { computed, ref, toRefs, toValue, type ComputedRef } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Contact } from './contact'
import { contactApi } from './contact.api'
import type { PaginationParams } from '@/type/pagination'
import { useInfiniteList, type PaginatedResponse } from '@/utilitaire/infinity-scroll/useInfiniteList'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'

const KEY = 'contacts';
export function useContacts(params: ComputedRef<PaginationParams>) {
  const queryClient = useQueryClient()

  const watchKeys = computed(() => ({
    search: params.value.search,
    sortKey: params.value.sortKey,
    sortDirection: params.value.sortDirection,
  }))
  //////////////////////////////
  const contacts = useInfiniteList<Contact>({
    limit: params.value.limit ?? PAGE_SIZE,
    watchKeys,
    queryFn: async ({ page, limit }) => {
      console.warn(" -- useContact contacts = useInfiniteList<Contact> ")
      // const response = await contactApi.getAll(params.value)
        // ✅ Utiliser page et limit du queryFn, pas ceux de params
        const response = await contactApi.getAll({
          ...toValue(params),
          page,      // ← page dynamique (1, 2, 3...)
          limit,     // ← limit dynamique
        })
      // ✅ Retourner l'objet IResponse complet, pas response.data
      console.log(" -- useContact response:",response)
      return response as PaginatedResponse<Contact>
    },
  })

 // ==================== CREATE ====================
  const createContact = useMutation({
    mutationFn: (data: Contact) => contactApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      contacts.refresh()
    },
  })

  // ==================== UPDATE ====================
  const updateContact = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Contact> }) =>
      contactApi.update(id, data),
    onMutate: async ({ id, data }) => {
      const previousItems = [...contacts.items.value]
      const index = contacts.items.value.findIndex((d) => d.id === id)
      if (index !== -1) {
        contacts.items.value[index] = { ...contacts.items.value[index], ...data } as Contact
      }
      return { previousItems, index }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousItems) {
        contacts.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      contacts.refresh()
    },
  })

  // ==================== DELETE ====================
  const deleteContact = useMutation({
    mutationFn: (id: number) => contactApi.delete(id),
    onMutate: async (id) => {
      const previousItems = [...contacts.items.value]
      contacts.items.value = contacts.items.value.filter((d) => d.id !== id)
      return { previousItems }
    },
    onError: (_err, _id, context) => {
      if (context?.previousItems) {
        contacts.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })

  return {
    contacts,
    createContact,
    updateContact,
    deleteContact,
    refresh: contacts.refresh,
  }
}