// types/pagination.ts
export interface PaginationParams {
  page?: number;   // commence à 1
  limit?: number;  // nombre d'éléments par page
  search?: string; // recherche optionnelle
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// export interface PaginatedResponse<T> {
//   data: T[];
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
// }

// export interface Response {
//   data: any;
//   succes: boolean
//   message: string
// }


export interface IPageInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface IResponse {
  success: boolean;
  message? : string 
  data?: any;
  pageInfo?: IPageInfo;
}