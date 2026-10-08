
import type { BaseEntity } from "@/type/base-entity";

export interface Role extends BaseEntity {
  code: string;
  label: string; 
}

export type CreateRoleDto = Omit<Role, keyof BaseEntity>;
export type UpdateRoleDto = Partial<CreateRoleDto>;