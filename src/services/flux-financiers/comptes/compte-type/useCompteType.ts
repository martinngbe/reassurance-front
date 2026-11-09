import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import type { PaginationParams } from '@/type/pagination';
import type { CreateCompteTypeDto, UpdateCompteTypeDto } from './compte-type';
import { compteTypeApi } from './compte-type.api';

const KEY = 'compteTypes';

export function useCompteTypes(params: MaybeRefOrGetter<PaginationParams> = {}) {
  const qc = useQueryClient();

  // ─── Queries ───────────────────────────────────────────────
  const compteTypes = useQuery({
    queryKey: computed(() => [KEY, toValue(params)]),
    queryFn: () => compteTypeApi.getAll(toValue(params)),
  });

  const compteTypeById = (id: number) =>
    useQuery({
      queryKey: [KEY, id],
      queryFn: () => compteTypeApi.getById(id),
      enabled: !!id,
    });

  // ─── Mutations ─────────────────────────────────────────────
  const createCompteType = useMutation({
    mutationFn: (data: CreateCompteTypeDto) => compteTypeApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const updateCompteType = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCompteTypeDto }) =>
      compteTypeApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, id] });
    },
  });

  const deleteCompteType = useMutation({
    mutationFn: (id: number) => compteTypeApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  return {
    compteTypes,
    compteTypeById,
    createCompteType,
    updateCompteType,
    deleteCompteType,
  };
}