import { ApiResponse } from '@/src/features/auth/domain/ApiResponse';
import { RouteSummary } from './RouteSummary';

export interface RoutesRepository {
  listRoutes: (opts?: { signal?: AbortSignal }) => Promise<ApiResponse<RouteSummary[]>>;
}

