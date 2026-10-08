import { apiClient } from '@/api/api-client';
import type { Campagne, CreateCampagneDto, UpdateCampagneDto } from '@/referentiel/campagne/campagne';
import type { IResponse, PaginationParams } from '@/type/pagination';

const BASE = '/campagnes';

export const campagneApi = {
  getAll: (params: PaginationParams = {}) =>
    apiClient
      .get<IResponse>(BASE, { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<Campagne>(`${BASE}/${id}`).then((r) => r.data),

  create: (data: CreateCampagneDto) =>
    apiClient.post<Campagne>(BASE, data).then((r) => r.data),

  update: (id: number, data: UpdateCampagneDto) =>
    apiClient.patch<Campagne>(`${BASE}/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
};



// import { apiClient } from '@/api/api-client';
// import type { Campagne, CreateCampagneDto, UpdateCampagneDto } from '@/referentiel/campagne/campagne';

// const BASE = '/campagnes';

// export const campagneApi = {
//   getAll: () =>
//     apiClient.get<Campagne[]>(BASE).then((r) => r.data),

//   getById: (id: number) =>
//     apiClient.get<Campagne>(`${BASE}/${id}`).then((r) => r.data),

//   create: (data: CreateCampagneDto) =>
//     apiClient.post<Campagne>(BASE, data).then((r) => r.data),

//   update: (id: number, data: UpdateCampagneDto) =>
//     apiClient.patch<Campagne>(`${BASE}/${id}`, data).then((r) => r.data),

//   delete: (id: number) =>
//     apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),
// };