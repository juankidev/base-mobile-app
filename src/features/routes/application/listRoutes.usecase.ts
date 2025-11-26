import { RoutesRepository } from '../domain/RoutesRepository';

export function listRoutesUseCase(repo: RoutesRepository) {
  return async (opts?: { signal?: AbortSignal }) => {
    return await repo.listRoutes(opts);
  };
}

