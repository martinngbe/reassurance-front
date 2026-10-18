import { apiClient } from '@/api/api-client';
import type { IResponse, PaginationParams } from '@/type/pagination';
import type { Region, CreateRegionDto, UpdateRegionDto } from './region';

const BASE = '/region';

export const regionApi = {
  getAll: (params: PaginationParams = {}) =>
    apiClient
      .get<IResponse>(BASE, { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<Region>(`${BASE}/${id}`).then((r) => r.data),

  create: (data: CreateRegionDto) =>
    apiClient.post<Region>(BASE, data).then((r) => r.data),

  update: (id: number, data: UpdateRegionDto) =>
    apiClient.patch<Region>(`${BASE}/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
};

