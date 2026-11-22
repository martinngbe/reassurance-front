import { apiClient } from '@/api/api-client';
import type { IResponse, PaginationParams } from '@/type/pagination';
import type { CreateCessionLegaleDto, CessionLegale, UpdateCessionLegaleDto } from './cession-legale';

const BASE = '/cession-legale';

export const cessionLegaleApi = {
  getAll: (params: PaginationParams = {}) =>
    apiClient
      .get<IResponse>(BASE, { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<CessionLegale>(`${BASE}/${id}`).then((r) => r.data),

  create: (data: CreateCessionLegaleDto) =>
    apiClient.post<CessionLegale>(BASE, data).then((r) => r.data),

  update: (id: number, data: UpdateCessionLegaleDto) =>
    apiClient.patch<CessionLegale>(`${BASE}/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
};

