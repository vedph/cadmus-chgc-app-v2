import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  RefLookupFilter,
  RefLookupService,
} from '@myrmidon/cadmus-refs-lookup';

/**
 * Lookup service for CHGC image annotation IDs. This just looks up
 * an array of thesaurus entries, matching the text entered by the user
 * (case-insensitive) in their values. The entries are either set via
 * `entries`, or received in the `entries` property of the lookup options.
 */
@Injectable()
export class IdLookupService implements RefLookupService {
  public readonly id = 'chgc-ids';

  /**
   * The entries to look up when no entries are passed via options.
   */
  public entries: ThesaurusEntry[] = [];

  private getEntries(options?: any): ThesaurusEntry[] {
    const entries = options?.entries as ThesaurusEntry[] | undefined;
    return entries?.length ? entries : this.entries;
  }

  /**
   * Lookup thesaurus entries.
   *
   * @param filter The filter.
   * @param options The options, which can include an entries array.
   * @returns Matches.
   */
  public lookup(
    filter: RefLookupFilter,
    options?: any,
  ): Observable<ThesaurusEntry[]> {
    const entries = this.getEntries(options);
    const text = filter.text?.trim().toLowerCase();
    if (!text || !entries.length) {
      return of([]);
    }
    const limit = filter.limit > 0 ? filter.limit : entries.length;
    const matches: ThesaurusEntry[] = [];
    for (const entry of entries) {
      if (entry.value?.toLowerCase().includes(text)) {
        matches.push(entry);
        if (matches.length >= limit) {
          break;
        }
      }
    }
    return of(matches);
  }

  /**
   * Get the entry with the specified ID.
   *
   * @param id The entry ID.
   * @returns The entry, or undefined if not found.
   */
  public getById(id: string): Observable<ThesaurusEntry | undefined> {
    return of(this.entries.find((e) => e.id === id));
  }

  public getName(item: ThesaurusEntry | undefined): string {
    return item?.value || '';
  }
}
