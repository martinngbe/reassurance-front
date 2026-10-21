// /referentiel/quittance/quittance.api.ts
import { apiClient } from '@/api/api-client'
import type { IResponse, PaginationParams } from '@/type/pagination'
import type {  Quittance, CreateQuittanceDto, UpdateQuittanceDto } from './quittance'

const BASE = '/quittance'

export const quittanceApi = {
  getAll: (params: PaginationParams = {}) => {
    return apiClient.get<IResponse>(BASE, { params }).then((r) => r.data)
  },
  getById: (id: number) =>
    apiClient.get<Quittance>(`${BASE}/${id}`).then((r) => r.data),
  create: (data: CreateQuittanceDto) =>
    apiClient.post<Quittance>(BASE, data).then((r) => r.data),
  update: (id: number, data: UpdateQuittanceDto) =>
    apiClient.patch<Quittance>(`${BASE}/${id}`, data).then((r) => r.data),
  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
}