import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ErrorService, EnvService } from '@myrmidon/ngx-tools';
import { Observable, catchError } from 'rxjs';

export interface ExportResult {
  xml?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor(
    private _http: HttpClient,
    private _error: ErrorService,
    private _env: EnvService
  ) {}

  /**
   * Exports a group of items into a new TEI document, or patches an
   * existing TEI document with exported data.
   *
   * @param id The group's ID.
   * @param xml The optional XML code representing a target TEI document
   * to patch. When not specified, a new document is created.
   * @returns Result.
   */
  public exportGroup(
    id: string,
    xml?: string | null
  ): Observable<ExportResult> {
    const url = `${this._env.get('apiUrl')}export/groups/${id}`;
    return this._http
      .post<ExportResult>(url, { xml: xml || '' })
      .pipe(catchError(this._error.handleError));
  }
}
