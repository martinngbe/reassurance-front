// /referentiel/quittanceCession/quittanceCession.api.ts
import { apiClient } from '@/api/api-client'
import type { IResponse, PaginationParams } from '@/type/pagination'
import type {  QuittanceCession, CreateQuittanceCessionDto, UpdateQuittanceCessionDto } from './quittance-cession'

const BASE = '/quittance-cession'

export const quittanceCessionApi = {
  getAll: (params: PaginationParams = {}) => {
    return apiClient.get<IResponse>(BASE, { params }).then((r) => r.data)
  },
  getById: (id: number) =>
    apiClient.get<QuittanceCession>(`${BASE}/${id}`).then((r) => r.data),
  create: (data: CreateQuittanceCessionDto) =>
    apiClient.post<QuittanceCession>(BASE, data).then((r) => r.data),
  update: (id: number, data: UpdateQuittanceCessionDto) =>
    apiClient.patch<QuittanceCession>(`${BASE}/${id}`, data).then((r) => r.data),
  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
}