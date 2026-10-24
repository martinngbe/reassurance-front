import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import type { PaginationParams } from '@/type/pagination';
import { natureOffreApi } from './nature-offre.api';
import type { CreateNatureOffreDto, UpdateNatureOffreDto } from './nanture-offre';

const KEY = 'natureOffres';

export function useNatureOffres(params: MaybeRefOrGetter<PaginationParams> = {}) {
  const qc = useQueryClient();

  // ─── Queries ───────────────────────────────────────────────
  const natureOffres = useQuery({
    queryKey: computed(() => [KEY, toValue(params)]),
    queryFn: () => natureOffreApi.getAll(toValue(params)),
  });

  const natureOffreById = (id: number) =>
    useQuery({
      queryKey: [KEY, id],
      queryFn: () => natureOffreApi.getById(id),
      enabled: !!id,
    });

  // ─── Mutations ─────────────────────────────────────────────
  const createNatureOffre = useMutation({
    mutationFn: (data: CreateNatureOffreDto) => natureOffreApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const updateNatureOffre = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateNatureOffreDto }) =>
      natureOffreApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, id] });
    },
  });

  const deleteNatureOffre = useMutation({
    mutationFn: (id: number) => natureOffreApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  return {
    natureOffres,
    natureOffreById,
    createNatureOffre,
    updateNatureOffre,
    deleteNatureOffre,
  };
}