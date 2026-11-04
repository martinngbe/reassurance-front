import { apiClient } from '@/api/api-client';
import type { IResponse, PaginationParams } from '@/type/pagination';
import type { NaturePlacement, CreateNaturePlacementDto, UpdateNaturePlacementDto } from './nature-placement';

const BASE = '/nature-placement';

export const naturePlacementApi = {
  getAll: (params: PaginationParams = {}) =>
    apiClient
      .get<IResponse>(BASE, { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<IResponse>(`${BASE}/${id}`).then((r) => r.data.data),

  create: (data: CreateNaturePlacementDto) =>
    apiClient.post<IResponse>(BASE, data).then((r) => r.data),

  update: (id: number, data: UpdateNaturePlacementDto) =>
    apiClient.patch<IResponse>(`${BASE}/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
};

