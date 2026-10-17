import type { Ref } from "vue";

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



export interface PaginationParams {
  page?: number
  limit?: number
  search?: string | undefined
  sortBy?: string | undefined
  sortKey?: string | undefined
  sortOrder?: 'ASC' | 'DESC' | undefined
}

export interface IPageInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface IResponse {
  success: boolean
  message?: string
  data?: any
  pageInfo?: IPageInfo
}