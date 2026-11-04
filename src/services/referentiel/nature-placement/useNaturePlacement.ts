import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import type { PaginationParams } from '@/type/pagination';
import { naturePlacementApi } from './nature-placement.api';
import type { CreateNaturePlacementDto, UpdateNaturePlacementDto } from './nature-placement';

const KEY = 'naturePlacements';

export function useNaturePlacements(params: MaybeRefOrGetter<PaginationParams> = {}) {
  const qc = useQueryClient();

  // ─── Queries ───────────────────────────────────────────────
  const naturePlacements = useQuery({
    queryKey: computed(() => [KEY, toValue(params)]),
    queryFn: () => naturePlacementApi.getAll(toValue(params)),
  });

  const naturePlacementById = (id: number) =>
    useQuery({
      queryKey: [KEY, id],
      queryFn: () => naturePlacementApi.getById(id),
      enabled: !!id,
    });

  // ─── Mutations ─────────────────────────────────────────────
  const createNaturePlacement = useMutation({
    mutationFn: (data: CreateNaturePlacementDto) => naturePlacementApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const updateNaturePlacement = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateNaturePlacementDto }) =>
      naturePlacementApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, id] });
    },
  });

  const deleteNaturePlacement = useMutation({
    mutationFn: (id: number) => naturePlacementApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  return {
    naturePlacements,
    naturePlacementById,
    createNaturePlacement,
    updateNaturePlacement,
    deleteNaturePlacement,
  };
}