// /referentiel/acteur/acteur.api.ts
import { apiClient } from '@/api/api-client'
import type { IResponse, PaginationParams } from '@/type/pagination'
import type {  Acteur, ActeurParams, CreateActeurDto, UpdateActeurDto } from './acteur'

const BASE = '/acteur'

export const acteurApi = {
  getAll: (params: ActeurParams = {}) => {
    return apiClient.get<IResponse>(BASE, { params }).then((r) => r.data)
  },
  getById: (id: number) =>
    apiClient.get<Acteur>(`${BASE}/${id}`).then((r) => r.data),
  create: (data: CreateActeurDto) =>
    apiClient.post<Acteur>(BASE, data).then((r) => r.data),
  update: (id: number, data: UpdateActeurDto) =>
    apiClient.patch<Acteur>(`${BASE}/${id}`, data).then((r) => r.data),
  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),

    // ⭐ NOUVELLES MÉTHODES POUR LE PDF
  printOne: (id: number) => {
    return apiClient.get(`${BASE}/${id}/print`, {
      responseType: 'blob', // Très important pour le binaire
    }).then((r) => r.data)
  },

  printList: (params: ActeurParams = {}) => {
    return apiClient.get(`${BASE}/print/all`, {
      params,
      responseType: 'blob',
    }).then((r) => r.data)
  },

}