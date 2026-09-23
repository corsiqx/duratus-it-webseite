import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { AuthService, requireSignIn, safeReturnUrl } from './auth';

describe('AuthService and guards', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  const runGuard = (url: string) =>
    TestBed.runInInjectionContext(() => requireSignIn({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot));

  it('redirects to the sign-in page and remembers the target', () => {
    const result = runGuard('/tickets/TCK-4821') as UrlTree;
    expect(result.toString()).toBe('/anmelden?ziel=%2Ftickets%2FTCK-4821');
  });

  it('lets signed-in users through and keeps a remembered session in localStorage', async () => {
    vi.useFakeTimers();
    const auth = TestBed.inject(AuthService);
    const login = auth.login('Max.Mustermann@Muster-GmbH.de', true);
    await vi.runAllTimersAsync();
    await login;
    vi.useRealTimers();

    expect(auth.session()?.email).toBe('max.mustermann@muster-gmbh.de');
    expect(localStorage.getItem('duratus-kundenportal-session')).not.toBeNull();
    expect(runGuard('/uebersicht')).toBe(true);

    auth.logout();
    expect(auth.isSignedIn()).toBe(false);
    expect(localStorage.getItem('duratus-kundenportal-session')).toBeNull();
  });

  it('only accepts internal return targets', () => {
    expect(safeReturnUrl('/rechnungen?status=offen')).toBe('/rechnungen?status=offen');
    expect(safeReturnUrl('https://example.com')).toBe('/uebersicht');
    expect(safeReturnUrl('//example.com')).toBe('/uebersicht');
    expect(safeReturnUrl('/anmelden')).toBe('/uebersicht');
    expect(safeReturnUrl(undefined)).toBe('/uebersicht');
  });
});
