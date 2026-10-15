import { apiClient } from '@/api/api-client';
import type { IResponse, PaginationParams } from '@/type/pagination';
import type { Branche } from '../branche/branche';
import type { CreateSousBrancheDto, SousBranche, UpdateSousBrancheDto } from './sous-branche';

const BASE = '/sous-branche';

export const sousBrancheApi = {
  getAll: (params: PaginationParams = {}) =>
    apiClient
      .get<IResponse>(BASE, { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<SousBranche>(`${BASE}/${id}`).then((r) => r.data),

  create: (data: CreateSousBrancheDto) =>
    apiClient.post<SousBranche>(BASE, data).then((r) => r.data),

  update: (id: number, data: UpdateSousBrancheDto) =>
    apiClient.patch<SousBranche>(`${BASE}/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
};

