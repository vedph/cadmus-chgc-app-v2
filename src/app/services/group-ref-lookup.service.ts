import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ItemService } from '@myrmidon/cadmus-api';
import {
  RefLookupFilter,
  RefLookupService,
} from '@myrmidon/cadmus-refs-lookup';

/**
 * Lookup service for item group IDs.
 */
@Injectable({
  providedIn: 'root',
})
export class GroupRefLookupService implements RefLookupService {
  private readonly _itemService = inject(ItemService);

  public readonly id = 'chgc-groups';

  public lookup(filter: RefLookupFilter, options?: any): Observable<string[]> {
    return this._itemService
      .getItemGroupIds(1, filter.limit, filter.text)
      .pipe(map((page) => page.items));
  }

  public getById(id: string): Observable<string | undefined> {
    return this._itemService
      .getItemGroupIds(1, 1, id)
      .pipe(map((page) => page.items.find((i) => i === id)));
  }

  public getName(item: string | undefined): string {
    return item || '';
  }
}
