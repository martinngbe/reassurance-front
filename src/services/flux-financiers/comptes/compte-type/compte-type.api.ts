import { apiClient } from '@/api/api-client';
import type { IResponse, PaginationParams } from '@/type/pagination';
import type { CreateCompteTypeDto, CompteType, UpdateCompteTypeDto } from './compte-type';

const BASE = '/compte-type';

export const compteTypeApi = {
  getAll: (params: PaginationParams = {}) =>
    apiClient
      .get<IResponse>(BASE, { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<IResponse>(`${BASE}/${id}`).then((r) => r.data.data),

  create: (data: CreateCompteTypeDto) =>
    apiClient.post<IResponse>(BASE, data).then((r) => r.data.data),

  update: (id: number, data: UpdateCompteTypeDto) =>
    apiClient.patch<IResponse>(`${BASE}/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
};

