// types/base.ts
export interface BaseEntity {
  id: number;
  createdAt: string; // ISO 'YYYY-MM-DDTHH:mm:ss.sssZ'
  updatedAt: string;
  
  createdBy: string;
  updatedBy: string;
}