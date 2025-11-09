export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface ApiSuccess<T> {
  data: T;
  message?: string;
  statusCode: number;
}

/**
 * Query Parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface SearchParams {
  search?: string;
}

export type QueryParams = PaginationParams & SortParams & SearchParams;