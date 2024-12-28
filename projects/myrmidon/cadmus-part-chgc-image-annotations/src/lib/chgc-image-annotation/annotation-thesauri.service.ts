import { Injectable } from '@angular/core';
import { ThesaurusService } from '@myrmidon/cadmus-api';
import { Thesaurus, ThesaurusEntry } from '@myrmidon/cadmus-core';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnnotationThesauriService {
  private _thesauri: { [key: string]: Thesaurus };

  constructor(private _thesService: ThesaurusService) {
    this._thesauri = {};
  }

  public getThesaurusEntries(id: string): Promise<ThesaurusEntry[]> {
    return new Promise<ThesaurusEntry[]>((resolve, reject) => {
      if (this._thesauri[id]) {
        resolve(this._thesauri[id].entries || []);
      } else {
        this._thesService
          .getThesaurus(id)
          .pipe(take(1))
          .subscribe({
            next: (thesaurus) => {
              this._thesauri[id] = thesaurus;
              resolve(thesaurus.entries || []);
            },
            error: (error) => {
              reject(error);
            },
          });
      }
    });
  }
}
