// /referentiel/contact/contact.api.ts
import { apiClient } from '@/api/api-client'
import type { IResponse, PaginationParams } from '@/type/pagination'
import type {  Contact, CreateContactDto, UpdateContactDto } from './contact'

const BASE = '/contact'

export const contactApi = {
  getAll: (params: PaginationParams = {}) => {
    return apiClient.get<IResponse>(BASE, { params }).then((r) => r.data)
  },
  getById: (id: number) =>
    apiClient.get<Contact>(`${BASE}/${id}`).then((r) => r.data),
  create: (data: CreateContactDto) =>
    apiClient.post<Contact>(BASE, data).then((r) => r.data),
  update: (id: number, data: UpdateContactDto) =>
    apiClient.patch<Contact>(`${BASE}/${id}`, data).then((r) => r.data),
  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
}