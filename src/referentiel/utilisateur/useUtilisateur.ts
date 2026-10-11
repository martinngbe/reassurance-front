import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { utilisateurApi } from '@/referentiel/utilisateur/utilisateur.api';
import type { CreateUtilisateurDto, UpdateUtilisateurDto } from '@/referentiel/utilisateur/utilisateur';
import type { PaginationParams } from '@/type/pagination';

const KEY = 'utilisateurs';

export function useUtilisateurs(params: MaybeRefOrGetter<PaginationParams> = {}) {
  const qc = useQueryClient();

  // ─── Queries ───────────────────────────────────────────────
  const utilisateurs = useQuery({
    queryKey: computed(() => [KEY, toValue(params)]),
    queryFn: () => utilisateurApi.getAll(toValue(params)),
  });

  const utilisateurById = (id: number) =>
    useQuery({
      queryKey: [KEY, id],
      queryFn: () => utilisateurApi.getById(id),
      enabled: !!id,
    });

  // ─── Mutations ─────────────────────────────────────────────
  const createUtilisateur = useMutation({
    mutationFn: (data: CreateUtilisateurDto) => utilisateurApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const updateUtilisateur = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUtilisateurDto }) =>
      utilisateurApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, id] });
    },
  });

  const deleteUtilisateur = useMutation({
    mutationFn: (id: number) => utilisateurApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  return {
    utilisateurs,
    utilisateurById,
    createUtilisateur,
    updateUtilisateur,
    deleteUtilisateur,
  };
}