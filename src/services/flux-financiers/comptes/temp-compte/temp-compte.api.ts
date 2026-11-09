import { apiClient } from '@/api/api-client';
import type { IResponse, PaginationParams } from '@/type/pagination';
import type { CreateTempCompteDto, TempCompte, UpdateTempCompteDto } from './temp-compte';

const BASE = '/temp-compte';

export const tempCompteApi = {
  getAll: (params: PaginationParams = {}) =>
    apiClient
      .get<IResponse>(BASE, { params })
      .then((r) => r.data),

   transfererDepuisTemp: async (tempCompteId: number): Promise<IResponse> => {
    const response = await apiClient.post(`${BASE}/${tempCompteId}/transferer`)
    return response.data // ou response.data.data selon ton format IResponse
  }, 
  getById: (id: number) =>
    apiClient.get<IResponse>(`${BASE}/${id}`).then((r) => r.data.data),

  create: (data: CreateTempCompteDto) =>
    apiClient.post<IResponse>(BASE, data).then((r) => r.data.data),

  update: (id: number, data: UpdateTempCompteDto) =>
    apiClient.patch<IResponse>(`${BASE}/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
};

