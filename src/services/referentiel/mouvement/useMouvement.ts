import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import type { PaginationParams } from '@/type/pagination';
import { mouvementApi } from './mouvement.api';
import type { CreateMouvementDto, UpdateMouvementDto } from './mouvement';

const KEY = 'mouvements';

export function useMouvements(params: MaybeRefOrGetter<PaginationParams> = {}) {
  const qc = useQueryClient();

  // ─── Queries ───────────────────────────────────────────────
  const mouvements = useQuery({
    queryKey: computed(() => [KEY, toValue(params)]),
    queryFn: () => mouvementApi.getAll(toValue(params)),
  });

  const mouvementById = (id: number) =>
    useQuery({
      queryKey: [KEY, id],
      queryFn: () => mouvementApi.getById(id),
      enabled: !!id,
    });

  // ─── Mutations ─────────────────────────────────────────────
  const createMouvement = useMutation({
    mutationFn: (data: CreateMouvementDto) => mouvementApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const updateMouvement = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMouvementDto }) =>
      mouvementApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, id] });
    },
  });

  const deleteMouvement = useMutation({
    mutationFn: (id: number) => mouvementApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  return {
    mouvements,
    mouvementById,
    createMouvement,
    updateMouvement,
    deleteMouvement,
  };
}