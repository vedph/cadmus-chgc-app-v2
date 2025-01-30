import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  MatCard,
  MatCardHeader,
  MatCardAvatar,
  MatCardTitle,
  MatCardContent,
  MatCardActions,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';

import { NgxToolsValidators } from '@myrmidon/ngx-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import {
  GalleryImage,
  GuidService,
  ListAnnotation,
} from '@myrmidon/ngx-annotorious';

import {
  CloseSaveButtonsComponent,
  EditedObject,
  ModelEditorComponentBase,
} from '@myrmidon/cadmus-ui';
import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  CHGC_IMAGE_ANNOTATIONS_PART_TYPEID,
  ChgcAnnotationPayload,
  ChgcImageAnnotation,
  ChgcImageAnnotationsPart,
} from '../chgc-image-annotations';
import { ChgcGalleryImgAnnotatorComponent } from '../chgc-gallery-img-annotator/chgc-gallery-img-annotator.component';

/**
 * ChgcImageAnnotationsPart editor component.
 * Thesauri: gallery-image-annotation-filters, chgc-ids.
 */
@Component({
  selector: 'cadmus-chgc-image-annotations-part',
  templateUrl: './chgc-image-annotations-part.component.html',
  styleUrls: ['./chgc-image-annotations-part.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCard,
    MatCardHeader,
    MatCardAvatar,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    ChgcGalleryImgAnnotatorComponent,
    MatCardActions,
    CloseSaveButtonsComponent,
  ],
})
export class ChgcImageAnnotationsPartComponent
  extends ModelEditorComponentBase<ChgcImageAnnotationsPart>
  implements OnInit
{
  private _updating?: boolean;

  public tabIndex: number;

  // gallery-image-annotation-filters
  public filterEntries: ThesaurusEntry[] | undefined;
  // chgc-ids
  public idEntries: ThesaurusEntry[] | undefined;

  public image?: GalleryImage;
  public annotations: FormControl<ListAnnotation<ChgcAnnotationPayload>[]>;

  public editedIndex: number;
  public editedAnnotation?: ChgcImageAnnotation;

  @ViewChild('editor', { static: false, read: ElementRef })
  public editorRef?: ElementRef;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _guid: GuidService
  ) {
    super(authService, formBuilder);
    this.tabIndex = 0;
    this.editedIndex = -1;
    // form
    this.annotations = formBuilder.control([], {
      // at least 1 entry
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      annotations: this.annotations,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'gallery-image-annotation-filters';
    if (this.hasThesaurus(key)) {
      this.filterEntries = thesauri[key].entries;
    } else {
      this.filterEntries = undefined;
    }
    key = 'chgc-ids';
    if (this.hasThesaurus(key)) {
      this.idEntries = thesauri[key].entries;
    } else {
      this.idEntries = undefined;
    }
  }

  private chgcToListAnnotation(
    source: ChgcImageAnnotation | null
  ): ListAnnotation<ChgcAnnotationPayload> | null {
    if (!source) {
      return null;
    }
    return {
      id: source.id,
      image: source.target,
      value: {
        id: source.id,
        target: {
          annotation: source.id,
          selector: JSON.parse(source.selector),
        },
        // we need a body for Annotorious to work
        bodies: [
          {
            id: this._guid.getGuid(),
            annotation: source.id,
            type: 'TextualBody',
            value: source.eid,
            purpose: 'tagging',
          },
        ],
      } as any,
      payload: {
        eid: source.eid,
        label: source.label,
        note: source.note,
      },
    };
  }

  private listToChgcAnnotation(
    source: ListAnnotation<ChgcAnnotationPayload> | null
  ): ChgcImageAnnotation | null {
    if (!source) {
      return null;
    }
    return {
      id: source.id,
      // defensive: should source.image not yet be set, use the current image
      target: source.image || this.image!,
      selector: JSON.stringify(source.value.target.selector),
      eid: source.payload?.eid || '',
      label: source.payload?.label || '',
      note: source.payload?.note || '',
    };
  }

  private updateForm(part?: ChgcImageAnnotationsPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }

    this._updating = true;
    console.log('Annotations part: set data', part);
    this.annotations.setValue(
      part.annotations.map((a) => this.chgcToListAnnotation(a)!) || []
    );
    this.image = part.image;
    this.form.markAsPristine();
    this._updating = false;
  }

  protected override onDataSet(
    data?: EditedObject<ChgcImageAnnotationsPart>
  ): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): ChgcImageAnnotationsPart {
    let part = this.getEditedPart(
      CHGC_IMAGE_ANNOTATIONS_PART_TYPEID
    ) as ChgcImageAnnotationsPart;
    part.image = this.image;
    part.annotations =
      this.annotations.value.map((a) => this.listToChgcAnnotation(a)!) || [];
    return part;
  }

  public onImageChange(image?: GalleryImage): void {
    if (this._updating) {
      return;
    }
    console.log('Annotations part: image change', image);
    this.image = image;
    if (this.image) {
      this.tabIndex = 0;
    }
  }

  public onAnnotationsChange(
    annotations: ListAnnotation<ChgcAnnotationPayload>[]
  ): void {
    if (this._updating) {
      return;
    }
    console.log('Annotations part: annotations change', annotations);
    this.annotations.setValue(annotations);
    this.annotations.updateValueAndValidity();
    this.annotations.markAsDirty();
  }
}
