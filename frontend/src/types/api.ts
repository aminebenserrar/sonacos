export type ApiValidationErrors = Record<string, string>;

export type ApiErrorResponse = {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path: string;
  validationErrors?: ApiValidationErrors;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};
