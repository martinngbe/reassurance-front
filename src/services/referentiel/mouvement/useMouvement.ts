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

  // const mouvementById = (id: number) =>
  //   useQuery({
  //     queryKey: [KEY, id],
  //     queryFn: () => mouvementApi.getById(id),
  //     enabled: !!id,
  //   });
  const mouvementById = (id: MaybeRefOrGetter<number | undefined>) =>
  useQuery({
    queryKey: computed(() => [KEY, 'by-id', toValue(id)]),
    queryFn: () => mouvementApi.getById(toValue(id)!),
    enabled: computed(() => Number(toValue(id)) > 0),
  });  
  const getMouvementByCode = (code: MaybeRefOrGetter<string | undefined>) =>
    useQuery({
      queryKey: computed(() => [KEY, 'by-code', toValue(code)]),
      queryFn: () => mouvementApi.getByCode(toValue(code)!),
      enabled: computed(() => Boolean(toValue(code)?.trim())),
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
    getMouvementByCode,
    createMouvement,
    updateMouvement,
    deleteMouvement,
  };
}