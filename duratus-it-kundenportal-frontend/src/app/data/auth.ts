import { Injectable, computed, inject, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { readJson, removeKey, writeJson } from './browser-storage';

const SESSION_KEY = 'duratus-kundenportal-session';

export interface Session {
  email: string;
  since: string;
}

/**
 * Demo sign-in. There is no identity provider yet: any valid e-mail with a password of at least 8 characters
 * opens a session. "Angemeldet bleiben" keeps it in localStorage, otherwise it ends with the browser tab.
 * Replace login() with the real authentication call (OIDC, Microsoft Entra ID or similar).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly current = signal<Session | null>(
    readJson<Session>('session', SESSION_KEY) ?? readJson<Session>('local', SESSION_KEY),
  );

  readonly session = this.current.asReadonly();
  readonly isSignedIn = computed(() => this.current() !== null);

  async login(email: string, remember: boolean): Promise<void> {
    // Simulated network round trip, so loading states can be seen and tested.
    await new Promise((resolve) => setTimeout(resolve, 700));
    const session: Session = { email: email.trim().toLowerCase(), since: new Date().toISOString() };
    writeJson(remember ? 'local' : 'session', SESSION_KEY, session);
    this.current.set(session);
  }

  logout(): void {
    removeKey('local', SESSION_KEY);
    removeKey('session', SESSION_KEY);
    this.current.set(null);
  }
}

/** Only internal paths are accepted as return targets (no open redirects). */
export function safeReturnUrl(value: string | null | undefined): string {
  return value && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/anmelden') ? value : '/uebersicht';
}

export const requireSignIn: CanActivateFn = (_route, state) =>
  inject(AuthService).isSignedIn() || inject(Router).createUrlTree(['/anmelden'], { queryParams: { ziel: state.url } });

export const redirectSignedIn: CanActivateFn = () =>
  !inject(AuthService).isSignedIn() || inject(Router).createUrlTree(['/uebersicht']);
