import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { SERVICE_LINES } from '../../content/managed-services';
import { PILLARS } from '../../content/site';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-pillars',
  imports: [RouterLink, NgIcon, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pillars.html',
})
export class Pillars {
  protected readonly managed = PILLARS[0];
  protected readonly products = PILLARS[1];
  protected readonly consulting = PILLARS[2];
  protected readonly lines = SERVICE_LINES;
}
