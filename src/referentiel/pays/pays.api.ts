import { apiClient } from '@/api/api-client';
import type { IResponse, PaginationParams } from '@/type/pagination';
import type { Pays, CreatePaysDto, UpdatePaysDto } from './pays';

const BASE = '/pays';

export const paysApi = {
  getAll: (params: PaginationParams = {}) =>
    apiClient
      .get<IResponse>(BASE, { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<Pays>(`${BASE}/${id}`).then((r) => r.data),

  create: (data: CreatePaysDto) =>
    apiClient.post<Pays>(BASE, data).then((r) => r.data),

  update: (id: number, data: UpdatePaysDto) =>
    apiClient.patch<Pays>(`${BASE}/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
};

