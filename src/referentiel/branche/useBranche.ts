import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import type { PaginationParams } from '@/type/pagination';
import { brancheApi } from './branche.api';
import type { CreateBrancheDto, UpdateBrancheDto } from './branche';

const KEY = 'branches';

export function useBranches(params: MaybeRefOrGetter<PaginationParams> = {}) {
  const qc = useQueryClient();

  // ─── Queries ───────────────────────────────────────────────
  const branches = useQuery({
    queryKey: computed(() => [KEY, toValue(params)]),
    queryFn: () => brancheApi.getAll(toValue(params)),
  });

  const brancheById = (id: number) =>
    useQuery({
      queryKey: [KEY, id],
      queryFn: () => brancheApi.getById(id),
      enabled: !!id,
    });

  // ─── Mutations ─────────────────────────────────────────────
  const createBranche = useMutation({
    mutationFn: (data: CreateBrancheDto) => brancheApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const updateBranche = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBrancheDto }) =>
      brancheApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, id] });
    },
  });

  const deleteBranche = useMutation({
    mutationFn: (id: number) => brancheApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  return {
    branches,
    brancheById,
    createBranche,
    updateBranche,
    deleteBranche,
  };
}