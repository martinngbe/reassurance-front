
import type { BaseEntity } from "@/type/base-entity";

export interface DomaineActivite extends BaseEntity {
  code: string;
  libelle: string;
}

export type CreateDomaineActiviteDto = Omit<DomaineActivite, keyof BaseEntity>;
export type UpdateDomaineActiviteDto = Partial<CreateDomaineActiviteDto>;