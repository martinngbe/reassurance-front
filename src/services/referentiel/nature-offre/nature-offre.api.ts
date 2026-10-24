import { apiClient } from '@/api/api-client';
import type { IResponse, PaginationParams } from '@/type/pagination';
import type { NatureOffre, CreateNatureOffreDto, UpdateNatureOffreDto } from './nanture-offre';

const BASE = '/nature-offre';

export const natureOffreApi = {
  getAll: (params: PaginationParams = {}) =>
    apiClient
      .get<IResponse>(BASE, { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<NatureOffre>(`${BASE}/${id}`).then((r) => r.data),

  create: (data: CreateNatureOffreDto) =>
    apiClient.post<NatureOffre>(BASE, data).then((r) => r.data),

  update: (id: number, data: UpdateNatureOffreDto) =>
    apiClient.patch<NatureOffre>(`${BASE}/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
};

