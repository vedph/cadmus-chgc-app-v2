import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import {
  HttpClient,
  HttpEventType,
  HttpParams,
  HttpRequest,
} from '@angular/common/http';
import { FormField, form, min, required } from '@angular/forms/signals';
import { Subscription } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { EnvService } from '@myrmidon/ngx-tools';

import { hasAllowedExtension } from './file-extension.validator';

interface UploadResult {
  importedIds: string[];
  error?: string;
}

/**
 * The file extensions accepted for thesauri import.
 */
export const THESAURI_IMPORT_EXTENSIONS = ['json', 'csv', 'xls', 'xlsx'];

@Component({
  selector: 'app-import-thesauri',
  templateUrl: './import-thesauri.component.html',
  styleUrl: './import-thesauri.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTooltipModule,
  ],
})
export class ImportThesauriComponent {
  private readonly _http = inject(HttpClient);
  private readonly _env = inject(EnvService);
  private _sub?: Subscription;

  public readonly accept = THESAURI_IMPORT_EXTENSIONS.map((e) => '.' + e).join(
    ',',
  );

  public readonly file = signal<File | null>(null);
  public readonly fileError = computed<string | null>(() => {
    const file = this.file();
    if (!file) {
      return 'file required';
    }
    return hasAllowedExtension(file.name, THESAURI_IMPORT_EXTENSIONS)
      ? null
      : 'invalid file type';
  });
  public readonly isExcel = computed(() =>
    /\.xlsx?$/i.test(this.file()?.name || ''),
  );

  private readonly _draft = signal({
    mode: 'R',
    excelSheet: 1,
    excelRow: 1,
    excelColumn: 1,
  });

  public readonly form = form(this._draft, (p) => {
    required(p.mode);
    min(p.excelSheet, 1);
    min(p.excelRow, 1);
    min(p.excelColumn, 1);
  });

  public readonly dryRun = signal<boolean>(false);
  public readonly uploadProgress = signal<number>(0);
  public readonly uploading = signal<boolean>(false);
  public readonly result = signal<UploadResult | undefined>(undefined);

  constructor() {
    inject(DestroyRef).onDestroy(() => this._sub?.unsubscribe());
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.file.set(input.files?.[0] || null);
    this.result.set(undefined);
  }

  private buildParams(): HttpParams {
    const draft = this._draft();
    let params = new HttpParams();
    if (draft.mode !== 'R') {
      params = params.set('mode', draft.mode);
    }
    if (this.isExcel()) {
      if (draft.excelSheet !== 1) {
        params = params.set('excelSheet', draft.excelSheet);
      }
      if (draft.excelRow !== 1) {
        params = params.set('excelRow', draft.excelRow);
      }
      if (draft.excelColumn !== 1) {
        params = params.set('excelColumn', draft.excelColumn);
      }
    }
    if (this.dryRun()) {
      params = params.set('dryRun', true);
    }
    return params;
  }

  public upload(): void {
    const file = this.file();
    if (this.uploading() || !file || this.fileError() || this.form().invalid()) {
      return;
    }
    this.result.set(undefined);
    this.uploadProgress.set(0);
    this.uploading.set(true);

    const fd = new FormData();
    fd.append('file', file, file.name);

    const request = new HttpRequest(
      'POST',
      `${this._env.get('apiUrl')}import/thesauri`,
      fd,
      {
        reportProgress: true,
        params: this.buildParams(),
      },
    );
    this._sub?.unsubscribe();
    this._sub = this._http.request<UploadResult>(request).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress.set(
            event.total ? Math.round((event.loaded / event.total) * 100) : 0,
          );
        } else if (event.type === HttpEventType.Response) {
          this.uploading.set(false);
          this.result.set(event.body || { importedIds: [] });
        }
      },
      error: (error) => {
        console.error('Error importing thesauri', error);
        this.uploading.set(false);
        this.result.set({
          importedIds: [],
          error:
            error?.error?.error ||
            error?.message ||
            'Error importing thesauri',
        });
      },
    });
  }

  public onCancel(): void {
    this._sub?.unsubscribe();
    this.uploading.set(false);
    this.uploadProgress.set(0);
  }
}
