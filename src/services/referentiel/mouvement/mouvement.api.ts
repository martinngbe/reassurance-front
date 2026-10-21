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

  create: (data: CreateMouvementDto) =>
    apiClient.post<Mouvement>(BASE, data).then((r) => r.data),

  update: (id: number, data: UpdateMouvementDto) =>
    apiClient.patch<Mouvement>(`${BASE}/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
};

