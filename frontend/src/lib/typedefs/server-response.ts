export type ServerResponseModel<T = any> = {
  data?: T;
  message?: string;
  statusCode?: number;
  success: boolean;
};
