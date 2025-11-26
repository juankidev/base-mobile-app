import { ApiResponse } from '@/src/features/auth/domain/ApiResponse';
import { RoutesRepository } from '../domain/RoutesRepository';
import { RouteSummary } from '../domain/RouteSummary';

export const routesRepositoryImpl: RoutesRepository = {
  async listRoutes(opts?: { signal?: AbortSignal }): Promise<ApiResponse<RouteSummary[]>> {
    const mock: RouteSummary[] = [
      { id: 991811, name: 'HUILA - CAQUETA', appointment: new Date(Date.now() + 60 * 60 * 1000).toISOString(), preparedOrders: 1, totalOrders: 4 },
      { id: 991812, name: 'GUAJIRA', appointment: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), preparedOrders: 0, totalOrders: 4 },
      { id: 991813, name: 'EJE CAFETERO', appointment: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), preparedOrders: 0, totalOrders: 4 },
      { id: 991814, name: 'LA PAZ', appointment: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), preparedOrders: 0, totalOrders: 4 },
      { id: 991810, name: 'OVEJAS', appointment: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), preparedOrders: 4, totalOrders: 4 },
    ];

    const timeout = new Promise<never>((_, reject) => {
      const t = setTimeout(() => {
        clearTimeout(t);
        reject(new Error('Timeout de 3s al cargar rutas'));
      }, 3000);
    });

    const request = new Promise<ApiResponse<RouteSummary[]>>((resolve) => {
      const t = setTimeout(() => {
        clearTimeout(t);
        resolve({ statusCode: 200, data: mock, message: null, success: true });
      }, 250);
      opts?.signal?.addEventListener('abort', () => {
        clearTimeout(t);
        resolve({ statusCode: 200, data: [], message: null, success: true });
      });
    });

    return Promise.race([request, timeout]);
  },
};

