import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import type { PaginationParams } from '@/type/pagination';
import { paysApi } from './pays.api';
import type { CreatePaysDto, UpdatePaysDto } from './pays';

const KEY = 'lesPays';

export function useLesPays(params: MaybeRefOrGetter<PaginationParams> = {}) {
  const qc = useQueryClient();

  // ─── Queries ───────────────────────────────────────────────
  const listePays = useQuery({
    queryKey: computed(() => [KEY, toValue(params)]),
    queryFn: () => paysApi.getAll(toValue(params)),
  });

  const paysById = (id: number) =>
    useQuery({
      queryKey: [KEY, id],
      queryFn: () => paysApi.getById(id),
      enabled: !!id,
    });

  // ─── Mutations ─────────────────────────────────────────────
  const createPays = useMutation({
    mutationFn: (data: CreatePaysDto) => paysApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const updatePays = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePaysDto }) =>
      paysApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, id] });
    },
  });

  const deletePays = useMutation({
    mutationFn: (id: number) => paysApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  return {
    listePays,
    paysById,
    createPays,
    updatePays,
    deletePays,
  };
}