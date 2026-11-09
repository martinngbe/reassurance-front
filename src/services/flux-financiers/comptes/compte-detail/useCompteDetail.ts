import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import type { PaginationParams } from '@/type/pagination';
import type { CreateCompteDetailDto, UpdateCompteDetailDto } from './compte-detail';
import { compteDetailApi } from './compte-detail.api';

const KEY = 'compteDetails';

export function useCompteDetails(params: MaybeRefOrGetter<PaginationParams> = {}) {
  const qc = useQueryClient();

  // ─── Queries ───────────────────────────────────────────────
  const compteDetails = useQuery({
    queryKey: computed(() => [KEY, toValue(params)]),
    queryFn: () => compteDetailApi.getAll(toValue(params)),
  });

  const compteDetailById = (id: number) =>
    useQuery({
      queryKey: [KEY, id],
      queryFn: () => compteDetailApi.getById(id),
      enabled: !!id,
    });

  // ─── Mutations ─────────────────────────────────────────────
  const createCompteDetail = useMutation({
    mutationFn: (data: CreateCompteDetailDto) => compteDetailApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const updateCompteDetail = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCompteDetailDto }) =>
      compteDetailApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, id] });
    },
  });

  const deleteCompteDetail = useMutation({
    mutationFn: (id: number) => compteDetailApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  return {
    compteDetails,
    compteDetailById,
    createCompteDetail,
    updateCompteDetail,
    deleteCompteDetail,
  };
}