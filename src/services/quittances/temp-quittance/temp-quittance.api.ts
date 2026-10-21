// /referentiel/tempTempQuittance/tempTempQuittance.api.ts
import { apiClient } from '@/api/api-client'
import type { IResponse, PaginationParams } from '@/type/pagination'
import type { TempQuittance, CreateTempQuittanceDto, UpdateTempQuittanceDto } from './temp-quittance'

const BASE = '/temp-quittance'

export const tempQuittanceApi = {
  getAll: (params: PaginationParams = {}) => {
    return apiClient.get<IResponse>(BASE, { params }).then((r) => r.data)
  },
  getById: (id: number) =>
    apiClient.get<TempQuittance>(`${BASE}/${id}`).then((r) => r.data),
  create: (data: CreateTempQuittanceDto) =>
    apiClient.post<TempQuittance>(BASE, data).then((r) => r.data),
  update: (id: number, data: UpdateTempQuittanceDto) =>
    apiClient.patch<TempQuittance>(`${BASE}/${id}`, data).then((r) => r.data),
  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
}