import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { PortalStore } from '../../data/portal-store';
import { HEALTH_STATE, PATCH_STATE } from '../../data/status';
import { FilterOption, FilterTabs } from '../../shared/filter-tabs';
import { StatusBadge } from '../../shared/status-badge';

type DeviceFilter = 'alle' | 'handlung' | 'offline';

@Component({
  selector: 'app-my-it',
  imports: [NgIcon, RouterLink, StatusBadge, FilterTabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block animate-fade-in motion-reduce:animate-none' },
  templateUrl: './my-it.html',
})
export class MyIt {
  protected readonly store = inject(PortalStore);
  protected readonly healthLabel = HEALTH_STATE;
  protected readonly patchLabel = PATCH_STATE;

  protected readonly filter = signal<DeviceFilter>('alle');
  protected readonly query = signal('');

  protected readonly filterOptions = computed<FilterOption<DeviceFilter>[]>(() => {
    const devices = this.store.devices();
    return [
      { value: 'alle', label: 'Alle', count: devices.length },
      { value: 'handlung', label: 'Updates offen', count: devices.filter((device) => device.patch !== 'aktuell').length },
      { value: 'offline', label: 'Offline', count: devices.filter((device) => !device.online).length },
    ];
  });

  protected readonly visibleDevices = computed(() => {
    const filter = this.filter();
    const query = this.query().trim().toLowerCase();
    return this.store.devices().filter((device) => {
      const matchesFilter =
        filter === 'alle' || (filter === 'handlung' && device.patch !== 'aktuell') || (filter === 'offline' && !device.online);
      return matchesFilter && (!query || `${device.name} ${device.department}`.toLowerCase().includes(query));
    });
  });
}
