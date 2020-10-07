export interface Transaction<T> {
  success: boolean;
  data: T;
  message?: string;
}
