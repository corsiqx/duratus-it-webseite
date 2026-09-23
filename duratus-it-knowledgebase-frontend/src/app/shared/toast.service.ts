import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  icon: string;
}

/** Short, non-blocking confirmations shown bottom right. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private readonly items = signal<readonly Toast[]>([]);
  readonly toasts = this.items.asReadonly();

  show(message: string, icon = 'phosphorCheckCircle', duration = 3200): void {
    const toast: Toast = { id: this.nextId++, message, icon };
    this.items.update((toasts) => [...toasts, toast]);
    setTimeout(() => this.dismiss(toast.id), duration);
  }

  dismiss(id: number): void {
    this.items.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }
}
