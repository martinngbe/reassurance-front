// /referentiel/police/police.api.ts
import { apiClient } from '@/api/api-client'
import type { IResponse, PaginationParams } from '@/type/pagination'
import type {  Police, CreatePoliceDto, UpdatePoliceDto } from './police'

const BASE = '/police'
// ⭐ Étendre PaginationParams pour accepter assureId
type PoliceQueryParams = PaginationParams & { 
  assureId?: number | string
  isCession?: boolean
}
export const policeApi = {
  getAll: (params: PoliceQueryParams = {}) => {
    return apiClient.get<IResponse>(BASE, { params }).then((r) => r.data)
  },

  getById: (id: number) =>
    apiClient.get<IResponse>(`${BASE}/${id}`).then((r) => r.data.data),
  create: (data: CreatePoliceDto) =>
    apiClient.post<IResponse>(BASE, data).then((r) => r.data.data),
  update: (id: number, data: UpdatePoliceDto) =>
    apiClient.patch<IResponse>(`${BASE}/${id}`, data).then((r) => r.data.data),
  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
}