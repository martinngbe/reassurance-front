import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import type { PaginationParams } from '@/type/pagination';
import { natureCessionApi } from './nature-cession.api';
import type { CreateNatureCessionDto, UpdateNatureCessionDto } from './nanture-cession';

const KEY = 'natureCessions';

export function useNatureCessions(params: MaybeRefOrGetter<PaginationParams> = {}) {
  const qc = useQueryClient();

  // ─── Queries ───────────────────────────────────────────────
  const natureCessions = useQuery({
    queryKey: computed(() => [KEY, toValue(params)]),
    queryFn: () => natureCessionApi.getAll(toValue(params)),
  });

  const natureCessionById = (id: number) =>
    useQuery({
      queryKey: [KEY, id],
      queryFn: () => natureCessionApi.getById(id),
      enabled: !!id,
    });

  // ─── Mutations ─────────────────────────────────────────────
  const createNatureCession = useMutation({
    mutationFn: (data: CreateNatureCessionDto) => natureCessionApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const updateNatureCession = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateNatureCessionDto }) =>
      natureCessionApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, id] });
    },
  });

  const deleteNatureCession = useMutation({
    mutationFn: (id: number) => natureCessionApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  return {
    natureCessions,
    natureCessionById,
    createNatureCession,
    updateNatureCession,
    deleteNatureCession,
  };
}