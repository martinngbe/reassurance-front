// /referentiel/assure/assure.api.ts
import { apiClient } from '@/api/api-client'
import type { IResponse, PaginationParams } from '@/type/pagination'
import type {  Assure, CreateAssureDto, UpdateAssureDto } from './assure'

const BASE = '/assure'

export const assureApi = {
  getAll: (params: PaginationParams = {}) => {
    return apiClient.get<IResponse>(BASE, { params }).then((r) => r.data)
  },
  getById: (id: number) =>
    apiClient.get<Assure>(`${BASE}/${id}`).then((r) => r.data),
  create: (data: CreateAssureDto) =>
    apiClient.post<Assure>(BASE, data).then((r) => r.data),
  update: (id: number, data: UpdateAssureDto) =>
    apiClient.patch<Assure>(`${BASE}/${id}`, data).then((r) => r.data),
  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
}