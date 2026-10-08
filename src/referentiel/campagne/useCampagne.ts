import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { campagneApi } from '@/referentiel/campagne/campagne.api';
import type { CreateCampagneDto, UpdateCampagneDto } from '@/referentiel/campagne/campagne';
import type { PaginationParams } from '@/type/pagination';

const KEY = 'campagnes';

export function useCampagnes(params: MaybeRefOrGetter<PaginationParams> = {}) {
  const qc = useQueryClient();

  // ─── Queries ───────────────────────────────────────────────
  const campagnes = useQuery({
    queryKey: computed(() => [KEY, toValue(params)]),
    queryFn: () => campagneApi.getAll(toValue(params)),
  });

  const campagneById = (id: number) =>
    useQuery({
      queryKey: [KEY, id],
      queryFn: () => campagneApi.getById(id),
      enabled: !!id,
    });

  // ─── Mutations ─────────────────────────────────────────────
  const createCampagne = useMutation({
    mutationFn: (data: CreateCampagneDto) => campagneApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const updateCampagne = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCampagneDto }) =>
      campagneApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, id] });
    },
  });

  const deleteCampagne = useMutation({
    mutationFn: (id: number) => campagneApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  return {
    campagnes,
    campagneById,
    createCampagne,
    updateCampagne,
    deleteCampagne,
  };
}