import type { BaseEntity } from "@/type/base-entity";
import type { Acteur } from "../acteur/acteur";

export interface Contact extends BaseEntity {
  
  nom: string;
  prenoms: string;
  email?: string;
  telephone?: string;
  acteurId: number;
}

// ✅ Type pour les données du formulaire (acteurId  peuvent être des objets)
export type ContactFormData = Partial<Omit<Contact, 'acteurId' >> & {
  acteurId: number | Acteur;
};

export type CreateContactDto = Omit<Contact, keyof BaseEntity>;
export type UpdateContactDto = Partial<CreateContactDto>;