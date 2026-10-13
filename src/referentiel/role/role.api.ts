import { apiClient } from '@/api/api-client';
import type { Role, CreateRoleDto, UpdateRoleDto } from '@/referentiel/role/role';
import type { PaginationParams, IResponse } from '@/type/pagination';

const BASE = '/role';

export const roleApi = {
  getAll: (params: PaginationParams = {}) =>
    apiClient
      .get<IResponse>(BASE, { params })
      .then((r) => r.data ),
 
  getById: (id: number) =>
    apiClient.get<IResponse>(`${BASE}/${id}`).then((r) => r.data),

  create: (data: CreateRoleDto) =>
    apiClient.post<IResponse>(BASE, data).then((r) => r.data),

  update: (id: number, data: UpdateRoleDto) =>
    apiClient.patch<IResponse>(`${BASE}/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),


  
  // ✅ Rôles d'un utilisateur avec marquage paginé
  getForUser: (userId: number, params: PaginationParams = {}) =>
    apiClient
      .get<IResponse>(`${BASE}/user/${userId}`, { params })
      .then((r) => r.data),

  // ✅ Mettre à jour les rôles d'un utilisateur
  updateUserRoles: (userId: number, roleIds: number[]) =>
    apiClient
      .patch<IResponse>(`/utilisateur/${userId}/roles`, { roleIds })
      .then((r) => r.data),
};
