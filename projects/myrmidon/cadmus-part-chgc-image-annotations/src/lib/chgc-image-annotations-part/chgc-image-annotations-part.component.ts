import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  untracked,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { validate } from '@angular/forms/signals';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { GalleryImage } from '@myrmidon/ngx-annotorious';
import { GalleryFilterEntry } from '@myrmidon/cadmus-img-gallery';
import {
  CloseSaveButtonsComponent,
  copyFormValue,
  HelpLinkComponent,
  ModelEditorComponentBase,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';

import {
  CHGC_GALLERY_FILTERS_THESAURUS_ID,
  CHGC_IDS_THESAURUS_ID,
  CHGC_IMAGE_ANNOTATIONS_PART_TYPEID,
  ChgcImageAnnotation,
  ChgcImageAnnotationsPart,
  ChgcListAnnotation,
  chgcToListAnnotation,
  listToChgcAnnotation,
} from '../chgc-image-annotations';
import { ChgcGalleryImgAnnotatorComponent } from '../chgc-gallery-img-annotator/chgc-gallery-img-annotator.component';
import { AnnotationThesauriService } from '../chgc-image-annotation/annotation-thesauri.service';

/**
 * The editable shape behind the part's form.
 */
interface ChgcImageAnnotationsPartDraft {
  image: GalleryImage | null;
  annotations: ChgcImageAnnotation[];
}

function copyImage(image?: GalleryImage | null): GalleryImage | null {
  if (!image) {
    return null;
  }
  const copy: GalleryImage = {
    id: image.id,
    uri: image.uri,
    title: image.title,
  };
  if (image.description) {
    copy.description = image.description;
  }
  return copy;
}

function toDraft(
  part?: ChgcImageAnnotationsPart | null,
): ChgcImageAnnotationsPartDraft {
  return {
    image: copyImage(part?.image),
    annotations: copyFormValue(part?.annotations || []),
  };
}

/**
 * ChgcImageAnnotationsPart editor component.
 * Thesauri: gallery-image-annotation-filters, chgc-ids.
 */
@Component({
  selector: 'cadmus-chgc-image-annotations-part',
  templateUrl: './chgc-image-annotations-part.component.html',
  styleUrl: './chgc-image-annotations-part.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TitleCasePipe,
    MatCardModule,
    MatIconModule,
    CloseSaveButtonsComponent,
    HelpLinkComponent,
    ChgcGalleryImgAnnotatorComponent,
  ],
})
export class ChgcImageAnnotationsPartComponent extends ModelEditorComponentBase<ChgcImageAnnotationsPart> {
  private readonly _annThesService = inject(AnnotationThesauriService);

  /**
   * The entries of the gallery-image-annotation-filters thesaurus.
   */
  public readonly filterEntries = computed<GalleryFilterEntry[] | undefined>(
    () => this.data()?.thesauri?.[CHGC_GALLERY_FILTERS_THESAURUS_ID]?.entries,
  );

  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));

  public readonly form = this.createForm(this._draft, (p) => {
    // at least 1 annotation
    validate(p.annotations, ({ value }) =>
      value().length ? null : { kind: 'required' },
    );
  });

  /**
   * The image being annotated.
   */
  public readonly image = computed<GalleryImage | undefined>(
    () => this.form.image().value() || undefined,
  );

  /**
   * The annotations as edited by the annotator.
   */
  public readonly listAnnotations = computed<ChgcListAnnotation[]>(() =>
    this.form
      .annotations()
      .value()
      .map((a) => chgcToListAnnotation(a)),
  );

  constructor() {
    super();
    // the annotation editor gets the IDs thesaurus from the annotation
    // thesauri service: seed it with the one loaded with the part, if any
    effect(() => {
      const thesaurus = this.data()?.thesauri?.[CHGC_IDS_THESAURUS_ID];
      if (thesaurus) {
        untracked(() => this._annThesService.setThesaurus(thesaurus, CHGC_IDS_THESAURUS_ID));
      }
    });
  }

  protected getValue(): ChgcImageAnnotationsPart {
    const part = this.getEditedPart(
      CHGC_IMAGE_ANNOTATIONS_PART_TYPEID,
    ) as ChgcImageAnnotationsPart;
    const draft = this._draft();
    part.image = copyImage(draft.image) || undefined;
    part.annotations = copyFormValue(draft.annotations);
    return part;
  }

  public onImageChange(image?: GalleryImage): void {
    setFieldFromChild(this.form.image, copyImage(image));
  }

  public onAnnotationsChange(annotations: ChgcListAnnotation[]): void {
    const image = this.form.image().value();
    setFieldFromChild(
      this.form.annotations,
      (annotations || []).map((a) => listToChgcAnnotation(a, image)),
    );
  }
}
