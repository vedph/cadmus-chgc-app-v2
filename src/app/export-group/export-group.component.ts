import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { form, maxLength, required } from '@angular/forms/signals';
import { take } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NgxMonacoEditorComponent } from '@jean-merelis/ngx-monaco-editor';

import { ThemeService } from '@myrmidon/ngx-mat-tools';
import { RefLookupComponent } from '@myrmidon/cadmus-refs-lookup';
import { setFieldFromEditor } from '@myrmidon/cadmus-ui';

import { GroupRefLookupService } from '../services/group-ref-lookup.service';
import { ExportService } from '../export.service';

/**
 * Export the items of a group into a new TEI document, or patch an
 * existing TEI document with them.
 */
@Component({
  selector: 'app-export-group',
  templateUrl: './export-group.component.html',
  styleUrl: './export-group.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    NgxMonacoEditorComponent,
    RefLookupComponent,
  ],
})
export class ExportGroupComponent {
  private readonly _service = inject(ExportService);
  private readonly _snackbar = inject(MatSnackBar);
  public readonly lookupService = inject(GroupRefLookupService);
  public readonly themeService = inject(ThemeService);
  public readonly setFieldFromEditor = setFieldFromEditor;

  public readonly busy = signal<boolean>(false);

  public readonly editorOptions = {
    minimap: { side: 'right' as const },
    wordWrap: 'on' as const,
    automaticLayout: true,
  };

  private readonly _draft = signal({ groupId: '', xml: '' });

  // the XML is the optional TEI document to patch, or the exported
  // document: it has no length limit, as it can be a large output
  public readonly form = form(this._draft, (p) => {
    required(p.groupId);
    maxLength(p.groupId, 100);
  });

  public onGroupChange(groupId: unknown): void {
    const field = this.form.groupId();
    field.value.set((groupId as string) || '');
    field.markAsDirty();
    field.markAsTouched();
  }

  public export(): void {
    if (this.busy() || this.form().invalid()) {
      return;
    }
    const groupId = this.form.groupId().value();
    this.busy.set(true);
    this._service
      .exportGroup(groupId, this.form.xml().value())
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this.busy.set(false);
          if (result.error) {
            this._snackbar.open(result.error, 'OK');
          } else {
            this.form.xml().value.set(result.xml || '');
          }
        },
        error: (error) => {
          this.busy.set(false);
          console.error('Error exporting group ' + groupId, error);
          this._snackbar.open(
            error?.message || 'Error exporting group',
            'OK',
          );
        },
      });
  }

  public save(): void {
    const xml = this.form.xml().value();
    if (this.busy() || this.form().invalid() || !xml) {
      return;
    }
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.form.groupId().value() + '.xml';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
