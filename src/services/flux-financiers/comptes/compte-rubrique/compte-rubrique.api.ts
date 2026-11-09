import { apiClient } from '@/api/api-client';
import type { IResponse, PaginationParams } from '@/type/pagination';
import type { CreateCompteRubriqueDto, CompteRubrique, UpdateCompteRubriqueDto } from './compte-rubrique';

const BASE = '/compte-rubrique';

export const compteRubriqueApi = {
  getAll: (params: PaginationParams = {}) =>
    apiClient
      .get<IResponse>(BASE, { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<IResponse>(`${BASE}/${id}`).then((r) => r.data.data),

  create: (data: CreateCompteRubriqueDto) =>
    apiClient.post<IResponse>(BASE, data).then((r) => r.data.data),

  update: (id: number, data: UpdateCompteRubriqueDto) =>
    apiClient.patch<IResponse>(`${BASE}/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
};

