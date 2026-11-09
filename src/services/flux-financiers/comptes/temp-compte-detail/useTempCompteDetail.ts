import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import type { PaginationParams } from '@/type/pagination';
import { tempCompteDetailApi } from './temp-compte-detail.api';
import type { CreateTempCompteDetailDto, UpdateTempCompteDetailDto } from './temp-compte-detail';

const KEY = 'tempCompteDetails';

export function useTempCompteDetails(params: MaybeRefOrGetter<PaginationParams> = {}) {
  const qc = useQueryClient();

  // ─── Queries ───────────────────────────────────────────────
  const tempCompteDetails = useQuery({
    queryKey: computed(() => [KEY, toValue(params)]),
    queryFn: () => tempCompteDetailApi.getAll(toValue(params)),
  });

  const tempCompteDetailById = (id: number) =>
    useQuery({
      queryKey: [KEY, id],
      queryFn: () => tempCompteDetailApi.getById(id),
      enabled: !!id,
    });

  // ─── Mutations ─────────────────────────────────────────────
  const createTempCompteDetail = useMutation({
    mutationFn: (data: CreateTempCompteDetailDto) => tempCompteDetailApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const updateTempCompteDetail = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTempCompteDetailDto }) =>
      tempCompteDetailApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, id] });
    },
  });

  const deleteTempCompteDetail = useMutation({
    mutationFn: (id: number) => tempCompteDetailApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  return {
    tempCompteDetails,
    tempCompteDetailById,
    createTempCompteDetail,
    updateTempCompteDetail,
    deleteTempCompteDetail,
  };
}