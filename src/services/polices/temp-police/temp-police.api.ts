// /referentiel/police/police.api.ts
import { apiClient } from '@/api/api-client'
import type { IResponse, PaginationParams } from '@/type/pagination'
import type {  TempPolice, CreateTempPoliceDto, UpdateTempPoliceDto } from './temp-police'

const BASE = '/temp-police'

export const tempPoliceApi = {
  getAll: (params: PaginationParams = {}) => {
    return apiClient.get<IResponse>(BASE, { params }).then((r) => r.data)
  },
 transfererDepuisTemp: async (tempPoliceId: number): Promise<IResponse> => {
      const response = await apiClient.post(`${BASE}/temp/${tempPoliceId}/transferer`)
      return response.data // ou response.data.data selon ton format IResponse
    },
  getById: (id: number) =>
    apiClient.get<IResponse>(`${BASE}/${id}`).then((r) => r.data.data),
  create: (data: CreateTempPoliceDto) =>
    apiClient.post<IResponse>(BASE, data).then((r) => r.data.data),
  update: (id: number, data: UpdateTempPoliceDto) =>
    apiClient.patch<IResponse>(`${BASE}/${id}`, data).then((r) => r.data.data),
  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
}