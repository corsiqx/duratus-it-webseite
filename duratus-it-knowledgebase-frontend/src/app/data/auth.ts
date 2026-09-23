import { Injectable, computed, inject, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { readJson, removeKey, writeJson } from './browser-storage';

const SESSION_KEY = 'duratus-wissensdatenbank-session';

export interface Session {
  email: string;
  since: string;
}

/**
 * Demo sign-in for employees. There is no identity provider yet: any duratus-it.de address with a password of at
 * least 8 characters opens a session, which ends with the browser tab.
 *
 * An internal tool with customer data and credentials must not go live like this. Replace login() with
 * Microsoft Entra ID (OIDC) including a second factor, and enforce the roles server-side.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly current = signal<Session | null>(readJson<Session>('session', SESSION_KEY));

  readonly session = this.current.asReadonly();
  readonly isSignedIn = computed(() => this.current() !== null);

  async login(email: string): Promise<void> {
    // Simulated network round trip, so loading states can be seen and tested.
    await new Promise((resolve) => setTimeout(resolve, 700));
    const session: Session = { email: email.trim().toLowerCase(), since: new Date().toISOString() };
    writeJson('session', SESSION_KEY, session);
    this.current.set(session);
  }

  logout(): void {
    removeKey('session', SESSION_KEY);
    this.current.set(null);
  }
}

/** Only internal paths are accepted as return targets (no open redirects). */
export function safeReturnUrl(value: string | null | undefined): string {
  return value && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/anmelden') ? value : '/start';
}

export const requireSignIn: CanActivateFn = (_route, state) =>
  inject(AuthService).isSignedIn() || inject(Router).createUrlTree(['/anmelden'], { queryParams: { ziel: state.url } });

export const redirectSignedIn: CanActivateFn = () =>
  !inject(AuthService).isSignedIn() || inject(Router).createUrlTree(['/start']);
