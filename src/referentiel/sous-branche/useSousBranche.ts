import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import type { PaginationParams } from '@/type/pagination';
import type { CreateSousBrancheDto, UpdateSousBrancheDto } from './sous-branche';
import { sousBrancheApi } from './sous-branche.api';

const KEY = 'sousBranches';

export function useSousBranches(params: MaybeRefOrGetter<PaginationParams> = {}) {
  const qc = useQueryClient();

  // ─── Queries ───────────────────────────────────────────────
  const sousBranches = useQuery({
    queryKey: computed(() => [KEY, toValue(params)]),
    queryFn: () => sousBrancheApi.getAll(toValue(params)),
  });

  const sousBrancheById = (id: number) =>
    useQuery({
      queryKey: [KEY, id],
      queryFn: () => sousBrancheApi.getById(id),
      enabled: !!id,
    });

  // ─── Mutations ─────────────────────────────────────────────
  const createSousBranche = useMutation({
    mutationFn: (data: CreateSousBrancheDto) => sousBrancheApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const updateSousBranche = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSousBrancheDto }) =>
      sousBrancheApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, id] });
    },
  });

  const deleteSousBranche = useMutation({
    mutationFn: (id: number) => sousBrancheApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  return {
    sousBranches,
    sousBrancheById,
    createSousBranche,
    updateSousBranche,
    deleteSousBranche,
  };
}