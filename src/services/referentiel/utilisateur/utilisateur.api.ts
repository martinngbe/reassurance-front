import { apiClient } from '@/api/api-client';
import type { CreateUtilisateurDto, UpdateUtilisateurDto } from '@/services/referentiel/utilisateur/utilisateur';
import type { PaginationParams, IResponse } from '@/type/pagination';

const BASE = '/utilisateur';

export const utilisateurApi = {
  getAll: (params: PaginationParams = {}) =>
    apiClient
      .get<IResponse>(BASE, { params })
      .then((r) => r.data ),
 
  getById: (id: number) =>
    apiClient.get<IResponse>(`${BASE}/${id}`).then((r) => r.data),

  create: (data: CreateUtilisateurDto) =>
    apiClient.post<IResponse>(BASE, data).then((r) => r.data),

  update: (id: number, data: UpdateUtilisateurDto) =>
    apiClient.patch<IResponse>(`${BASE}/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete<void>(`${BASE}/${id}`).then((r) => r.data),


   // ✅ Nouvelle méthode : récupère tous les rôles avec marquage
  getRolesWithAssignment: (id: number) =>
    apiClient.get<IResponse>(`${BASE}/${id}/roles`).then((r) => r.data),

  // ✅ Optionnel : met à jour les rôles d'un utilisateur
  updateRoles: (id: number, roleIds: number[]) =>
    apiClient.patch<IResponse>(`${BASE}/${id}/roles`, { roleIds }).then((r) => r.data),
};
