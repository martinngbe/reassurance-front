// /referentiel/police/police.api.ts
import { apiClient } from '@/api/api-client'
import type { IResponse, PaginationParams } from '@/type/pagination'
import type {  TempPolice, CreateTempPoliceDto, UpdateTempPoliceDto } from './temp-police'

const BASE = '/temp-police'

export const tempPoliceApi = {
  getAll: (params: PaginationParams = {}) => {
    return apiClient.get<IResponse>(BASE, { params }).then((r) => r.data)
  },
  getById: (id: number) =>
    apiClient.get<TempPolice>(`${BASE}/${id}`).then((r) => r.data),
  create: (data: CreateTempPoliceDto) =>
    apiClient.post<TempPolice>(BASE, data).then((r) => r.data),
  update: (id: number, data: UpdateTempPoliceDto) =>
    apiClient.patch<TempPolice>(`${BASE}/${id}`, data).then((r) => r.data),
  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
}