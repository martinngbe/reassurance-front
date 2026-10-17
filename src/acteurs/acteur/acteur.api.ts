// /referentiel/acteur/acteur.api.ts
import { apiClient } from '@/api/api-client'
import type { IResponse, PaginationParams } from '@/type/pagination'
import type {  Acteur, CreateActeurDto, UpdateActeurDto } from './acteur'

const BASE = '/acteur'

export const acteurApi = {
  getAll: (params: PaginationParams = {}) => {
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
}