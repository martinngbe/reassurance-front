import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import type { PaginationParams } from '@/type/pagination';
import type { CreateCompteRubriqueDto, UpdateCompteRubriqueDto } from './compte-rubrique';
import { compteRubriqueApi } from './compte-rubrique.api';

const KEY = 'compteRubriques';

export function useCompteRubriques(params: MaybeRefOrGetter<PaginationParams> = {}) {
  const qc = useQueryClient();

  // ─── Queries ───────────────────────────────────────────────
  const compteRubriques = useQuery({
    queryKey: computed(() => [KEY, toValue(params)]),
    queryFn: () => compteRubriqueApi.getAll(toValue(params)),
  });

  const compteRubriqueById = (id: number) =>
    useQuery({
      queryKey: [KEY, id],
      queryFn: () => compteRubriqueApi.getById(id),
      enabled: !!id,
    });

  // ─── Mutations ─────────────────────────────────────────────
  const createCompteRubrique = useMutation({
    mutationFn: (data: CreateCompteRubriqueDto) => compteRubriqueApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const updateCompteRubrique = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCompteRubriqueDto }) =>
      compteRubriqueApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, id] });
    },
  });

  const deleteCompteRubrique = useMutation({
    mutationFn: (id: number) => compteRubriqueApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  return {
    compteRubriques,
    compteRubriqueById,
    createCompteRubrique,
    updateCompteRubrique,
    deleteCompteRubrique,
  };
}