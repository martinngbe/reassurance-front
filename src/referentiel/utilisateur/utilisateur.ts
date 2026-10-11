
import type { BaseEntity } from "@/type/base-entity";

export interface Utilisateur extends BaseEntity {
  nom: string;
  prenoms: string; 
  email: string; 
}

export type CreateUtilisateurDto = Omit<Utilisateur, keyof BaseEntity>;
export type UpdateUtilisateurDto = Partial<CreateUtilisateurDto>;