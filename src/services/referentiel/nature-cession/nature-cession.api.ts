import { apiClient } from '@/api/api-client';
import type { IResponse, PaginationParams } from '@/type/pagination';
import type { NatureCession, CreateNatureCessionDto, UpdateNatureCessionDto } from './nanture-cession';

const BASE = '/nature-cession';

export const natureCessionApi = {
  getAll: (params: PaginationParams = {}) =>
    apiClient
      .get<IResponse>(BASE, { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<NatureCession>(`${BASE}/${id}`).then((r) => r.data),

  create: (data: CreateNatureCessionDto) =>
    apiClient.post<NatureCession>(BASE, data).then((r) => r.data),

  update: (id: number, data: UpdateNatureCessionDto) =>
    apiClient.patch<NatureCession>(`${BASE}/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
};

