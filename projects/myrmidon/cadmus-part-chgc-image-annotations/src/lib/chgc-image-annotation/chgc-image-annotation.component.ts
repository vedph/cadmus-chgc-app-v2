import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgIf } from '@angular/common';

import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import { ListAnnotation } from '@myrmidon/ngx-annotorious';
import { RefLookupComponent } from '@myrmidon/cadmus-refs-lookup';

import { ChgcAnnotationPayload } from '../chgc-image-annotations';
import { AnnotationThesauriService } from './annotation-thesauri.service';
import { IdLookupService } from './id-lookup.service';

/**
 * Editor for CHGC image annotations.
 */
@Component({
  selector: 'cadmus-chgc-image-annotation',
  templateUrl: './chgc-image-annotation.component.html',
  styleUrls: ['./chgc-image-annotation.component.css'],
  providers: [IdLookupService],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RefLookupComponent,
    NgIf,
    MatError,
    MatFormField,
    MatLabel,
    MatInput,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
})
export class ChgcImageAnnotationComponent implements OnInit {
  private _annotation: ListAnnotation<ChgcAnnotationPayload> | undefined;

  /**
   * The annotation to edit.
   */
  @Input()
  public get annotation():
    | ListAnnotation<ChgcAnnotationPayload>
    | undefined
    | null {
    return this._annotation;
  }
  public set annotation(
    value: ListAnnotation<ChgcAnnotationPayload> | undefined | null
  ) {
    if (this._annotation === value) {
      return;
    }
    this._annotation = value || undefined;
    this.updateForm(this._annotation);
  }

  @Output()
  public cancel: EventEmitter<void>;

  @Output()
  public annotationChange: EventEmitter<ListAnnotation<ChgcAnnotationPayload>>;

  // chgc-ids
  public idEntries: ThesaurusEntry[] | undefined;

  public eid: FormControl<ThesaurusEntry | null>;
  public label: FormControl<string | null>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  constructor(
    private _annThesService: AnnotationThesauriService,
    formBuilder: FormBuilder,
    public idLookupService: IdLookupService
  ) {
    // form
    this.eid = formBuilder.control(null, Validators.required);
    this.label = formBuilder.control(null, Validators.maxLength(100));
    this.note = formBuilder.control(null, Validators.maxLength(1000));
    this.form = formBuilder.group({
      eid: this.eid,
      label: this.label,
      note: this.note,
    });
    // events
    this.annotationChange = new EventEmitter<
      ListAnnotation<ChgcAnnotationPayload>
    >();
    this.cancel = new EventEmitter<void>();
  }

  public ngOnInit(): void {
    // get the thesaurus from service as this editor is instantiated
    // by the dialog service
    this._annThesService.getThesaurusEntries('chgc-ids').then((entries) => {
      this.idEntries = entries;
    });
  }

  private updateForm(annotation?: ListAnnotation<ChgcAnnotationPayload>): void {
    if (!annotation?.payload) {
      this.form.reset();
      return;
    }
    // in CHGC id is always equal to value
    this.eid.setValue({
      id: annotation.payload!.eid,
      value: annotation.payload!.eid,
    });
    this.label.setValue(annotation.payload.label || null);
    this.note.setValue(annotation.payload.note || null);
    this.form.markAsPristine();
  }

  private getModel(): ListAnnotation<ChgcAnnotationPayload> {
    return {
      ...this._annotation!,
      payload: {
        eid: this.eid.value?.id || '',
        label: this.label.value || undefined,
        note: this.note.value || undefined,
      } as ChgcAnnotationPayload,
    };
  }

  public onItemChange(item: unknown) {
    this.eid.setValue((item as ThesaurusEntry) || null);
    this.eid.markAsDirty();
    this.eid.updateValueAndValidity();
  }

  public close(): void {
    this.cancel.emit();
  }

  public save(): void {
    if (!this.form.valid) {
      return;
    }
    this._annotation = this.getModel();
    this.annotationChange.emit(this._annotation);
  }
}
