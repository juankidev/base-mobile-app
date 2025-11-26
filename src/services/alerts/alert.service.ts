export type AlertType = 'error' | 'warning' | 'neutral' | 'success';

export type AlertPayload = {
  type: AlertType;
  title: string;
  message: string;
  durationMs?: number;
};

class AlertService {
  private listeners = new Set<(payload: AlertPayload | null) => void>();

  show(payload: AlertPayload) {
    this.listeners.forEach((l) => l(payload));
    const timeout = payload.durationMs ?? 5000;
    if (timeout > 0) {
      setTimeout(() => this.clear(), timeout);
    }
  }

  clear() {
    this.listeners.forEach((l) => l(null));
  }

  subscribe(listener: (payload: AlertPayload | null) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const alertService = new AlertService();

