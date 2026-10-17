// /referentiel/devise/devise.api.ts
import { apiClient } from '@/api/api-client'
import type { IResponse, PaginationParams } from '@/type/pagination'
import type { Devise, CreateDeviseDto, UpdateDeviseDto } from './devise'

const BASE = '/devise'

export const deviseApi = {
  getAll: (params: PaginationParams = {}) => {
    return apiClient.get<IResponse>(BASE, { params }).then((r) => r.data)
  },
  getById: (id: number) =>
    apiClient.get<Devise>(`${BASE}/${id}`).then((r) => r.data),
  create: (data: CreateDeviseDto) =>
    apiClient.post<Devise>(BASE, data).then((r) => r.data),
  update: (id: number, data: UpdateDeviseDto) =>
    apiClient.patch<Devise>(`${BASE}/${id}`, data).then((r) => r.data),
  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
}