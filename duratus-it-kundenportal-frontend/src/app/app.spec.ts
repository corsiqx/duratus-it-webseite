import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { App } from './app';
import { PortalShell } from './layout/portal-shell';
import { APP_ICONS } from './shared/icons';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App, PortalShell],
      providers: [provideRouter([]), provideIcons(APP_ICONS)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the grouped portal navigation with attention counters', async () => {
    const fixture = TestBed.createComponent(PortalShell);
    await fixture.whenStable();
    const nav = (fixture.nativeElement as HTMLElement).querySelector('nav[aria-label="Bereiche"]');
    for (const label of ['Übersicht', 'Tickets', 'Meine IT', 'Arbeitsnachweise', 'Angebote', 'Verträge', 'E-Rechnungen', 'Zahlungsinformationen']) {
      expect(nav?.textContent).toContain(label);
    }
    expect(nav?.textContent).toContain('Verträge und Finanzen');
    expect(nav?.querySelector('a[href="/tickets"]')?.textContent).toMatch(/1\s*offen/);
  });
});
