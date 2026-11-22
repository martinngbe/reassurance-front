import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import type { CreateCessionLegaleDto, CessionLegaleParams, UpdateCessionLegaleDto } from './cession-legale';
import { cessionLegaleApi } from './cession-legale.api';

const KEY = 'cessionLegales';

export function useCessionLegales(params: MaybeRefOrGetter<CessionLegaleParams> = {}) {
  const qc = useQueryClient();

  // ─── Queries ───────────────────────────────────────────────
  const cessionLegales = useQuery({
    queryKey: computed(() => [KEY, toValue(params)]),
    queryFn: () => cessionLegaleApi.getAll(toValue(params)),
  });

  const cessionLegaleById = (id: number) =>
    useQuery({
      queryKey: [KEY, id],
      queryFn: () => cessionLegaleApi.getById(id),
      enabled: !!id,
    });

  // ─── Mutations ─────────────────────────────────────────────
  const createCessionLegale = useMutation({
    mutationFn: (data: CreateCessionLegaleDto) => cessionLegaleApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const updateCessionLegale = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCessionLegaleDto }) =>
      cessionLegaleApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, id] });
    },
  });

  const deleteCessionLegale = useMutation({
    mutationFn: (id: number) => cessionLegaleApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  return {
    cessionLegales,
    cessionLegaleById,
    createCessionLegale,
    updateCessionLegale,
    deleteCessionLegale,
  };
}