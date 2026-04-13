import { ApiError } from './api';

export function queryErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Erro desconhecido';
}
