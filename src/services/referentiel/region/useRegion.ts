import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import type { PaginationParams } from '@/type/pagination';
import { regionApi } from './region.api';
import type { CreateRegionDto, UpdateRegionDto } from './region';

const KEY = 'regions';

export function useRegions(params: MaybeRefOrGetter<PaginationParams> = {}) {
  const qc = useQueryClient();

  // ─── Queries ───────────────────────────────────────────────
  const regions = useQuery({
    queryKey: computed(() => [KEY, toValue(params)]),
    queryFn: () => regionApi.getAll(toValue(params)),
  });

  const regionById = (id: number) =>
    useQuery({
      queryKey: [KEY, id],
      queryFn: () => regionApi.getById(id),
      enabled: !!id,
    });

  // ─── Mutations ─────────────────────────────────────────────
  const createRegion = useMutation({
    mutationFn: (data: CreateRegionDto) => regionApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const updateRegion = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRegionDto }) =>
      regionApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, id] });
    },
  });

  const deleteRegion = useMutation({
    mutationFn: (id: number) => regionApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  return {
    regions,
    regionById,
    createRegion,
    updateRegion,
    deleteRegion,
  };
}