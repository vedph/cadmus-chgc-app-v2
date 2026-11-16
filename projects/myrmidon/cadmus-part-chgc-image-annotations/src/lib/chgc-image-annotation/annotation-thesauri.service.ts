import { inject, Injectable } from '@angular/core';
import { firstValueFrom, Observable, of, shareReplay } from 'rxjs';

import { ThesaurusService } from '@myrmidon/cadmus-api';
import { Thesaurus, ThesaurusEntry } from '@myrmidon/cadmus-core';

/**
 * Cache of the thesauri used by the annotation editor. The editor is
 * instantiated by the dialog service, so it cannot receive thesauri from
 * the part editor: it gets them from this service, which loads each
 * thesaurus once. The part editor can seed it with the thesauri it has
 * already loaded, via `setThesaurus`.
 */
@Injectable({
  providedIn: 'root',
})
export class AnnotationThesauriService {
  private readonly _thesService = inject(ThesaurusService);
  private readonly _cache = new Map<string, Observable<Thesaurus>>();

  /**
   * Store the specified thesaurus in the cache.
   *
   * @param thesaurus The thesaurus.
   * @param id The ID to store it under. When not specified, this is the
   * thesaurus ID without its language suffix (e.g. `chgc-ids` for
   * `chgc-ids@en`).
   */
  public setThesaurus(thesaurus: Thesaurus, id?: string): void {
    const key = id || thesaurus?.id?.split('@')[0];
    if (key && thesaurus) {
      this._cache.set(key, of(thesaurus));
    }
  }

  /**
   * Get the entries of the specified thesaurus.
   *
   * @param id The thesaurus ID.
   * @returns Promise with the entries (empty when the thesaurus has none).
   * A failed download is not cached, so it will be retried.
   */
  public getThesaurusEntries(id: string): Promise<ThesaurusEntry[]> {
    let thesaurus$ = this._cache.get(id);
    if (!thesaurus$) {
      thesaurus$ = this._thesService
        .getThesaurus(id)
        .pipe(shareReplay({ bufferSize: 1, refCount: false }));
      this._cache.set(id, thesaurus$);
    }
    const request$ = thesaurus$;
    return firstValueFrom(request$).then(
      (thesaurus) => thesaurus?.entries || [],
      (error) => {
        if (this._cache.get(id) === request$) {
          this._cache.delete(id);
        }
        throw error;
      },
    );
  }
}
