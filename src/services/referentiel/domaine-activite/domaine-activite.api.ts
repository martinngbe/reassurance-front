import { apiClient } from '@/api/api-client';
import type { IResponse, PaginationParams } from '@/type/pagination';
import type { DomaineActivite, CreateDomaineActiviteDto, UpdateDomaineActiviteDto } from './domaine-activite';

const BASE = '/domaine-activite';

export const domaineActiviteApi = {
  getAll: (params: PaginationParams = {}) =>
    apiClient
      .get<IResponse>(BASE, { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<DomaineActivite>(`${BASE}/${id}`).then((r) => r.data),

  create: (data: CreateDomaineActiviteDto) =>
    apiClient.post<DomaineActivite>(BASE, data).then((r) => r.data),

  update: (id: number, data: UpdateDomaineActiviteDto) =>
    apiClient.patch<DomaineActivite>(`${BASE}/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
};

