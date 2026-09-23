import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { OPENDESK_CONTACT, OPENDESK_FEATURES, OPENDESK_PACKAGES } from '../../content/opendesk';
import { PageHero } from '../../shared/page-hero';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-opendesk',
  imports: [PageHero, NgIcon, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './opendesk.html',
})
export class OpenDesk {
  protected readonly features = OPENDESK_FEATURES;
  protected readonly packages = OPENDESK_PACKAGES;
  protected readonly contact = OPENDESK_CONTACT;
}
