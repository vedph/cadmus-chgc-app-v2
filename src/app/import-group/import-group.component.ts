import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { take } from 'rxjs';

import { NgeMonacoModule } from '@cisstech/nge/monaco';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ImportService } from '../import.service';

@Component({
  selector: 'app-import-group',
  templateUrl: './import-group.component.html',
  styleUrls: ['./import-group.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    NgeMonacoModule,
  ],
})
export class ImportGroupComponent implements OnDestroy {
  private readonly _disposables: monaco.IDisposable[] = [];
  private _model?: monaco.editor.ITextModel;
  private _editorModel?: monaco.editor.IStandaloneCodeEditor;

  public groupId: FormControl<string | null>;
  public form: FormGroup;
  public busy?: boolean;
  public xml: FormControl<string | null>;
  public shortener: FormControl<string | null>;
  public addedCount: number;

  constructor(
    formBuilder: FormBuilder,
    private _service: ImportService,
    private _snackbar: MatSnackBar
  ) {
    this.groupId = new FormControl(null, [
      Validators.required,
      Validators.maxLength(100),
    ]);
    this.xml = formBuilder.control(null, [
      Validators.required,
      Validators.maxLength(50000),
    ]);
    this.shortener = new FormControl(null, Validators.maxLength(1000));
    this.form = formBuilder.group({
      groupId: this.groupId,
      xml: this.xml,
      shortener: this.shortener,
    });
    this.addedCount = 0;
  }

  public onCreateEditor(editor: monaco.editor.IEditor) {
    editor.updateOptions({
      minimap: {
        side: 'right',
      },
      wordWrap: 'on',
      automaticLayout: true,
    });
    this._model = this._model || monaco.editor.createModel('', 'xml');
    editor.setModel(this._model);
    this._editorModel = editor as monaco.editor.IStandaloneCodeEditor;

    this._disposables.push(
      this._model.onDidChangeContent((e) => {
        this.xml.setValue(this._editorModel!.getValue());
        this.xml.markAsDirty();
        this.xml.updateValueAndValidity();
      })
    );
  }

  public ngOnDestroy() {
    this._disposables.forEach((d) => d.dispose());
  }

  public import(): void {
    if (this.busy || this.form.invalid) {
      return;
    }
    this.busy = true;
    this._service
      .importGroup(
        this.groupId.value!,
        this.xml.value,
        this.shortener.value || undefined
      )
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this.busy = false;
          if (result.error) {
            this._snackbar.open(result.error, 'OK');
          } else {
            this.addedCount = result.count;
          }
        },
        error: (error) => {
          this.busy = false;
          if (error) {
            console.error(JSON.stringify(error));
          }
          this._snackbar.open(error.message || 'Error importing group', 'OK');
        },
      });
  }
}
