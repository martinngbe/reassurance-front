// useRole.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { roleApi } from '@/services/referentiel/role/role.api';
import type { CreateRoleDto, UpdateRoleDto } from '@/services/referentiel/role/role';
import type { PaginationParams } from '@/type/pagination';

const KEY = 'roles';

export function useRoles(params: MaybeRefOrGetter<PaginationParams> = {}) {
  const qc = useQueryClient();

  const roles = useQuery({
    queryKey: computed(() => [KEY, toValue(params)]),
    queryFn: () => roleApi.getAll(toValue(params)),
  });

  const roleById = (id: number) =>
    useQuery({
      queryKey: [KEY, id],
      queryFn: () => roleApi.getById(id),
      enabled: !!id,
    });

  // ✅ Query : rôles d'un utilisateur avec marquage
  const rolesForUser = (
    userId: MaybeRefOrGetter<number>,
    params: MaybeRefOrGetter<PaginationParams> = {},
  ) =>
    useQuery({
      queryKey: computed(() => [
        KEY,
        'user',
        toValue(userId),
        toValue(params),
      ]),
      queryFn: () => roleApi.getForUser(toValue(userId), toValue(params)),
      enabled: computed(() => !!toValue(userId)),
    });

  const createRole = useMutation({
    mutationFn: (data: CreateRoleDto) => roleApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const updateRole = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRoleDto }) =>
      roleApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, id] });
    },
  });

  const deleteRole = useMutation({
    mutationFn: (id: number) => roleApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  // ✅ Mutation : mise à jour des rôles d'un utilisateur
  const updateUserRoles = useMutation({
    mutationFn: ({ userId, roleIds }: { userId: number; roleIds: number[] }) =>
      roleApi.updateUserRoles(userId, roleIds),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: [KEY, 'user', userId] });
      qc.invalidateQueries({ queryKey: ['utilisateurs', userId] });
    },
  });

  return {
    roles,
    roleById,
    rolesForUser,
    createRole,
    updateRole,
    deleteRole,
    updateUserRoles,
  };
}