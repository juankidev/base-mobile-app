export interface RouteSummary {
  id: number;
  name: string;
  appointment: string; // ISO datetime
  preparedOrders: number;
  totalOrders: number;
}

