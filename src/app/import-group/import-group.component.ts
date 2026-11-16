import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormField, form, maxLength, required } from '@angular/forms/signals';
import { take } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NgxMonacoEditorComponent } from '@jean-merelis/ngx-monaco-editor';

import { ThemeService } from '@myrmidon/ngx-mat-tools';
import { setFieldFromEditor } from '@myrmidon/cadmus-ui';

import { ImportService } from '../import.service';

/**
 * Import a TEI document into a group of new items.
 */
@Component({
  selector: 'app-import-group',
  templateUrl: './import-group.component.html',
  styleUrl: './import-group.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatTooltipModule,
    NgxMonacoEditorComponent,
  ],
})
export class ImportGroupComponent {
  private readonly _service = inject(ImportService);
  private readonly _snackbar = inject(MatSnackBar);
  public readonly themeService = inject(ThemeService);
  public readonly setFieldFromEditor = setFieldFromEditor;

  public readonly busy = signal<boolean>(false);
  public readonly addedCount = signal<number | undefined>(undefined);

  public readonly editorOptions = {
    minimap: { side: 'right' as const },
    wordWrap: 'on' as const,
    automaticLayout: true,
  };

  private readonly _draft = signal({ groupId: '', xml: '', shortener: '' });

  public readonly form = form(this._draft, (p) => {
    required(p.groupId);
    maxLength(p.groupId, 100);
    required(p.xml);
    maxLength(p.xml, 50000);
    maxLength(p.shortener, 1000);
  });

  public onGroupIdEnter(event: Event): void {
    event.preventDefault();
    this.import();
  }

  public import(): void {
    if (this.busy()) {
      return;
    }
    if (this.form().invalid()) {
      this.form().markAsTouched();
      return;
    }
    const draft = this._draft();
    this.busy.set(true);
    this.addedCount.set(undefined);
    this._service
      .importGroup(
        draft.groupId.trim(),
        draft.xml,
        draft.shortener.trim() || undefined,
      )
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this.busy.set(false);
          if (result.error) {
            this._snackbar.open(result.error, 'OK');
          } else {
            this.addedCount.set(result.count);
          }
        },
        error: (error) => {
          this.busy.set(false);
          console.error('Error importing group ' + draft.groupId, error);
          this._snackbar.open(
            error?.message || 'Error importing group',
            'OK',
          );
        },
      });
  }
}
