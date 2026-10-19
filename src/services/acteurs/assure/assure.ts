import type { DomaineActivite } from "@/services/referentiel/domaine-activite/domaine-activite";
import type { Pays } from "@/services/referentiel/pays/pays";
import type { BaseEntity } from "@/type/base-entity";

export interface Assure extends BaseEntity {
  numero: string;
  sigle: string;
  raisonSociale: string;   // ✅ Corrigé : était number
  email?: string;          // ✅ Corrigé : était number

  // Relations
  pays?: Pays;
  paysId: number;

  domaineActivite?: DomaineActivite;
  domaineActiviteId: number;
}

// ✅ Type pour les données du formulaire (paysId et domaineActiviteId peuvent être des objets)
export type AssureFormData = Partial<Omit<Assure, 'paysId' | 'domaineActiviteId'>> & {
  paysId: number | Pays;
  domaineActiviteId: number | DomaineActivite;
};

export type CreateAssureDto = Omit<Assure, keyof BaseEntity>;
export type UpdateAssureDto = Partial<CreateAssureDto>;