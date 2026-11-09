import { apiClient } from '@/api/api-client';
import type { IResponse, PaginationParams } from '@/type/pagination';
import type { CreateTempCompteDetailDto, UpdateTempCompteDetailDto } from './temp-compte-detail';

const BASE = '/temp-compte-detail';

export const tempCompteDetailApi = {
  getAll: (params: PaginationParams = {}) =>
    apiClient
      .get<IResponse>(`${BASE}/rubriques-with-soldes`, { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<IResponse>(`${BASE}/${id}`).then((r) => r.data.data),

  create: (data: CreateTempCompteDetailDto) =>
    apiClient.post<IResponse>(BASE, data).then((r) => r.data.data),

  update: (id: number, data: UpdateTempCompteDetailDto) =>
    apiClient.patch<IResponse>(`${BASE}/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
};

