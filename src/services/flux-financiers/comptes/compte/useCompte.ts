import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import type { PaginationParams } from '@/type/pagination';
import { compteApi } from './compte.api';
import type { CreateCompteDto, UpdateCompteDto } from './compte';

const KEY = 'comptes';

export function useComptes(params: MaybeRefOrGetter<PaginationParams> = {}) {
  const qc = useQueryClient();

  // ─── Queries ───────────────────────────────────────────────
  const comptes = useQuery({
    queryKey: computed(() => [KEY, toValue(params)]),
    queryFn: () => compteApi.getAll(toValue(params)),
  });

  const compteById = (id: number) =>
    useQuery({
      queryKey: [KEY, id],
      queryFn: () => compteApi.getById(id),
      enabled: !!id,
    });

  // ─── Mutations ─────────────────────────────────────────────
  const createCompte = useMutation({
    mutationFn: (data: CreateCompteDto) => compteApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const updateCompte = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCompteDto }) =>
      compteApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, id] });
    },
  });

  const deleteCompte = useMutation({
    mutationFn: (id: number) => compteApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  return {
    comptes,
    compteById,
    createCompte,
    updateCompte,
    deleteCompte,
  };
}