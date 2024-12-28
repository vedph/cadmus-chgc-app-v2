import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  RefLookupFilter,
  RefLookupService,
} from '@myrmidon/cadmus-refs-lookup';

/**
 * Lookup service for CHGC image annotation IDs. This just lookups
 * the received array of thesaurus entries, filtering by the text
 * entered by user.
 */
@Injectable()
export class IdLookupService implements RefLookupService {
  /**
   * Lookup thesaurus entries.
   *
   * @param filter The filter.
   * @param options The options, which should include an entries array.
   * @returns Matches.
   */
  lookup(filter: RefLookupFilter, options?: any): Observable<any[]> {
    const entries = options?.entries as ThesaurusEntry[];
    if (!filter.text || !entries?.length) {
      return of([]);
    }
    // collect all the entries including filter.text
    const matches: ThesaurusEntry[] = [];
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (entry.value.includes(filter.text)) {
        matches.push(entry);
        if (matches.length >= filter.limit) {
          break;
        }
      }
    }
    return of(matches);
  }

  getName(item: ThesaurusEntry): string {
    return item?.value || '';
  }
}
