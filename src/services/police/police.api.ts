// /referentiel/police/police.api.ts
import { apiClient } from '@/api/api-client'
import type { IResponse, PaginationParams } from '@/type/pagination'
import type {  Police, CreatePoliceDto, UpdatePoliceDto } from './police'

const BASE = '/police'
// ⭐ Étendre PaginationParams pour accepter assureId
type PoliceQueryParams = PaginationParams & { 
  assureId?: number | string
}
export const policeApi = {
  getAll: (params: PoliceQueryParams = {}) => {
    return apiClient.get<IResponse>(BASE, { params }).then((r) => r.data)
  },

   transfererDepuisTemp: async (tempPoliceId: number): Promise<IResponse> => {
    const response = await apiClient.post(`${BASE}/temp/${tempPoliceId}/transferer`)
    return response.data // ou response.data.data selon ton format IResponse
  },

  getById: (id: number) =>
    apiClient.get<Police>(`${BASE}/${id}`).then((r) => r.data),
  create: (data: CreatePoliceDto) =>
    apiClient.post<Police>(BASE, data).then((r) => r.data),
  update: (id: number, data: UpdatePoliceDto) =>
    apiClient.patch<Police>(`${BASE}/${id}`, data).then((r) => r.data),
  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
}