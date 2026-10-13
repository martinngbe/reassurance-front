
import type { BaseEntity } from "@/type/base-entity";

export interface Utilisateur extends BaseEntity {
  nom: string;
  prenoms: string; 
  email: string; 
  isActive?: boolean
}
export interface RoleWithAssignment {
  id: number;
  code: string;
  label: string;
  description?: string;
  assigned: boolean;
}
export type CreateUtilisateurDto = Omit<Utilisateur, keyof BaseEntity>;
export type UpdateUtilisateurDto = Partial<CreateUtilisateurDto>;