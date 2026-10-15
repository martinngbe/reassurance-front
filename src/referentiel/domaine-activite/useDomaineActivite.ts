import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import type { PaginationParams } from '@/type/pagination';
import type { CreateDomaineActiviteDto, UpdateDomaineActiviteDto } from './domaine-activite';
import { domaineActiviteApi } from './domaine-activite.api';

const KEY = 'domaineActivites';

export function useDomaineActivites(params: MaybeRefOrGetter<PaginationParams> = {}) {
  const qc = useQueryClient();

  // ─── Queries ───────────────────────────────────────────────
  const domaineActivites = useQuery({
    queryKey: computed(() => [KEY, toValue(params)]),
    queryFn: () => domaineActiviteApi.getAll(toValue(params)),
  });

  const domaineActiviteById = (id: number) =>
    useQuery({
      queryKey: [KEY, id],
      queryFn: () => domaineActiviteApi.getById(id),
      enabled: !!id,
    });

  // ─── Mutations ─────────────────────────────────────────────
  const createDomaineActivite = useMutation({
    mutationFn: (data: CreateDomaineActiviteDto) => domaineActiviteApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const updateDomaineActivite = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDomaineActiviteDto }) =>
      domaineActiviteApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, id] });
    },
  });

  const deleteDomaineActivite = useMutation({
    mutationFn: (id: number) => domaineActiviteApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  return {
    domaineActivites,
    domaineActiviteById,
    createDomaineActivite,
    updateDomaineActivite,
    deleteDomaineActivite,
  };
}