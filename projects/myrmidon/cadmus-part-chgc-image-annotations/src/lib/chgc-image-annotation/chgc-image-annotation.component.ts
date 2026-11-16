import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormField, form, maxLength, required } from '@angular/forms/signals';
import { TextFieldModule } from '@angular/cdk/text-field';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { RefLookupComponent } from '@myrmidon/cadmus-refs-lookup';
import { isImplicitSubmission } from '@myrmidon/cadmus-ui';

import {
  buildChgcAnnotationBody,
  CHGC_IDS_THESAURUS_ID,
  ChgcListAnnotation,
} from '../chgc-image-annotations';
import { AnnotationThesauriService } from './annotation-thesauri.service';
import { IdLookupService } from './id-lookup.service';

interface ChgcImageAnnotationDraft {
  eid: string;
  label: string;
  note: string;
}

function toDraft(annotation?: ChgcListAnnotation): ChgcImageAnnotationDraft {
  return {
    eid: annotation?.payload?.eid || '',
    label: annotation?.payload?.label || '',
    note: annotation?.payload?.note || '',
  };
}

/**
 * Editor for the payload of a CHGC image annotation. The entity ID is
 * picked from the `chgc-ids` thesaurus, which is loaded via
 * `AnnotationThesauriService`, as this editor is usually instantiated
 * by the dialog service.
 */
@Component({
  selector: 'cadmus-chgc-image-annotation',
  templateUrl: './chgc-image-annotation.component.html',
  styleUrl: './chgc-image-annotation.component.css',
  providers: [IdLookupService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    TextFieldModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    RefLookupComponent,
  ],
})
export class ChgcImageAnnotationComponent {
  private readonly _thesauri = inject(AnnotationThesauriService);
  public readonly idLookupService = inject(IdLookupService);

  /**
   * The annotation to edit. It is set to the edited annotation on save.
   */
  public readonly annotation = model<ChgcListAnnotation>();

  /**
   * Emitted when the user discards the changes.
   */
  public readonly cancel = output();

  /**
   * The entries of the `chgc-ids` thesaurus.
   */
  public readonly idEntries = signal<ThesaurusEntry[]>([]);

  /**
   * The error occurred while loading the IDs thesaurus, if any.
   */
  public readonly idEntriesError = signal<string | undefined>(undefined);

  private readonly _draft = linkedSignal(() => toDraft(this.annotation()));

  public readonly form = form(this._draft, (p) => {
    required(p.eid);
    maxLength(p.eid, 300);
    maxLength(p.label, 100);
    maxLength(p.note, 1000);
  });

  /**
   * The entry corresponding to the current ID, as displayed by the lookup.
   * In CHGC the ID is always equal to the value of its entry.
   */
  public readonly eidItem = computed<ThesaurusEntry | undefined>(() => {
    const eid = this.form.eid().value();
    if (!eid) {
      return undefined;
    }
    return (
      this.idEntries().find((e) => e.id === eid) || { id: eid, value: eid }
    );
  });

  /**
   * The options for the ID lookup.
   */
  public readonly lookupOptions = computed(() => ({
    entries: this.idEntries(),
  }));

  constructor() {
    // reset the interaction state whenever a new annotation is bound
    effect(() => {
      this.annotation();
      untracked(() => this.form().reset());
    });

    this._thesauri.getThesaurusEntries(CHGC_IDS_THESAURUS_ID).then(
      (entries) => {
        this.idLookupService.entries = entries;
        this.idEntries.set(entries);
      },
      (error) => {
        console.error(
          `Error loading thesaurus ${CHGC_IDS_THESAURUS_ID}`,
          error,
        );
        this.idEntriesError.set(
          `Unable to load the IDs thesaurus (${CHGC_IDS_THESAURUS_ID}).`,
        );
      },
    );
  }

  public onItemChange(item: unknown): void {
    const eid = (item as ThesaurusEntry | null | undefined)?.id || '';
    const field = this.form.eid();
    if (field.value() !== eid) {
      field.value.set(eid);
      field.markAsDirty();
    }
    field.markAsTouched();
  }

  public onEnterKey(event: Event): void {
    if (!isImplicitSubmission(event)) {
      return;
    }
    // always prevent default, so that no outer editor gets saved
    event.preventDefault();
    if (this.form().valid() && this.form().dirty()) {
      this.save();
    }
  }

  public close(): void {
    this.cancel.emit();
  }

  private getAnnotation(): ChgcListAnnotation | undefined {
    const annotation = this.annotation();
    if (!annotation) {
      return undefined;
    }
    const draft = this._draft();
    const eid = draft.eid.trim();
    const otherBodies = (annotation.value?.bodies || []).filter(
      (b) => b.purpose !== 'tagging',
    );
    return {
      ...annotation,
      value: {
        ...annotation.value,
        // keep the Annotorious body in synch with the ID
        bodies: [buildChgcAnnotationBody(annotation.id, eid), ...otherBodies],
      },
      payload: {
        eid,
        label: draft.label.trim() || undefined,
        note: draft.note.trim() || undefined,
      },
    };
  }

  public save(): void {
    if (this.form().invalid()) {
      this.form().markAsTouched();
      return;
    }
    const annotation = this.getAnnotation();
    if (annotation) {
      this.annotation.set(annotation);
    }
  }
}
