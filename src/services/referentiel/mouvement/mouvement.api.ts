import { apiClient } from '@/api/api-client';
import type { IResponse, PaginationParams } from '@/type/pagination';
import type { Mouvement, CreateMouvementDto, UpdateMouvementDto } from './mouvement';

const BASE = '/mouvement';

export const mouvementApi = {
  getAll: (params: PaginationParams = {}) =>
    apiClient
      .get<IResponse>(BASE, { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<Mouvement>(`${BASE}/${id}`).then((r) => r.data),

  getByCode: (code: string) =>
    apiClient.get<IResponse>(`${BASE}/code/${code}`).then((r) => r.data.data),

  create: (data: CreateMouvementDto) =>
    apiClient.post<IResponse>(BASE, data).then((r) => r.data.data),

  update: (id: number, data: UpdateMouvementDto) =>
    apiClient.patch<IResponse>(`${BASE}/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
};

