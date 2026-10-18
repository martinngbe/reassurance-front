import { apiClient } from '@/api/api-client';
import type { IResponse, PaginationParams } from '@/type/pagination';
import type { Branche, CreateBrancheDto, UpdateBrancheDto } from './branche';

const BASE = '/branche';

export const brancheApi = {
  getAll: (params: PaginationParams = {}) =>
    apiClient
      .get<IResponse>(BASE, { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<Branche>(`${BASE}/${id}`).then((r) => r.data),

  create: (data: CreateBrancheDto) =>
    apiClient.post<Branche>(BASE, data).then((r) => r.data),

  update: (id: number, data: UpdateBrancheDto) =>
    apiClient.patch<Branche>(`${BASE}/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
};

