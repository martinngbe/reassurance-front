// /referentiel/quittance/quittance.api.ts
import { apiClient } from '@/api/api-client'
import type { IResponse, PaginationParams } from '@/type/pagination'
import type {  Quittance, CreateQuittanceDto, UpdateQuittanceDto } from './quittance'

const BASE = '/quittance'
// ⭐ Étendre PaginationParams pour accepter assureId
type QuittanceQueryParams = PaginationParams & { 
  policeId?: number 
}
export const quittanceApi = {
  getAll: (params: QuittanceQueryParams = {}, signal?: AbortSignal) => {
    return apiClient.get<IResponse>(BASE, { params , signal}).then((r) => r.data)
  },
  getById: (id: number) =>
    apiClient.get<Quittance>(`${BASE}/${id}`).then((r) => r.data),
  create: (data: CreateQuittanceDto) =>
    apiClient.post<Quittance>(BASE, data).then((r) => r.data),
  update: (id: number, data: UpdateQuittanceDto) =>
    apiClient.patch<Quittance>(`${BASE}/${id}`, data).then((r) => r.data),
  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),

      // ⭐ NOUVELLES MÉTHODES POUR LE PDF
  printOne: (id: number) => {
    return apiClient.get(`${BASE}/${id}/print`, {
      responseType: 'blob', // Très important pour le binaire
    }).then((r) => r.data)
  },

  // printList: (params: QuittanceParams = {}) => {
  //   return apiClient.get(`${BASE}/print/all`, {
  //     params,
  //     responseType: 'blob',
  //   }).then((r) => r.data)
  // },
}