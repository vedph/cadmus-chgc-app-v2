import { Injectable } from '@angular/core';
import { ItemService } from '@myrmidon/cadmus-api';
import { Observable, map } from 'rxjs';

import {
  RefLookupFilter,
  RefLookupService,
} from '@myrmidon/cadmus-refs-lookup';

@Injectable({
  providedIn: 'root',
})
export class GroupRefLookupService implements RefLookupService {
  constructor(private _itemService: ItemService) {}

  public lookup(filter: RefLookupFilter, options?: any): Observable<string[]> {
    return this._itemService
      .getItemGroupIds(1, filter.limit, filter.text)
      .pipe(map((page) => page.items));
  }

  public getName(item: string): string {
    return item;
  }
}
