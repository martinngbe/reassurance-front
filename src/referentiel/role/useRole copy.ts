// import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
// import { computed, toValue, type MaybeRefOrGetter } from 'vue';
// import { roleApi } from '@/referentiel/role/role.api';
// import type { CreateRoleDto, UpdateRoleDto } from '@/referentiel/role/role';
// import type { PaginationParams } from '@/type/pagination';

// const KEY = 'roles';

// export function useRoles(params: MaybeRefOrGetter<PaginationParams> = {}) {
//   const qc = useQueryClient();

//   // ─── Queries ───────────────────────────────────────────────
//   const roles = useQuery({
//     queryKey: computed(() => [KEY, toValue(params)]),
//     queryFn: () => roleApi.getAll(toValue(params)),
//   });

//   const roleById = (id: number) =>
//     useQuery({
//       queryKey: [KEY, id],
//       queryFn: () => roleApi.getById(id),
//       enabled: !!id,
//     });

//   // ─── Mutations ─────────────────────────────────────────────
//   const createRole = useMutation({
//     mutationFn: (data: CreateRoleDto) => roleApi.create(data),
//     onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
//   });

//   const updateRole = useMutation({
//     mutationFn: ({ id, data }: { id: number; data: UpdateRoleDto }) =>
//       roleApi.update(id, data),
//     onSuccess: (_, { id }) => {
//       qc.invalidateQueries({ queryKey: [KEY] });
//       qc.invalidateQueries({ queryKey: [KEY, id] });
//     },
//   });

//   const deleteRole = useMutation({
//     mutationFn: (id: number) => roleApi.delete(id),
//     onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
//   });




  
//   return {
//     roles,
//     roleById,
//     createRole,
//     updateRole,
//     deleteRole,
//   };
// }