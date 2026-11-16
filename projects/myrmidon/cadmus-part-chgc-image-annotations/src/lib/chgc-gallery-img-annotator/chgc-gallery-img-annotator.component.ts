import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  GalleryImage,
  ImgAnnotationList,
  ImgAnnotatorDirective,
  ImgAnnotatorToolbarComponent,
} from '@myrmidon/ngx-annotorious';
import {
  GalleryFilterEntry,
  GalleryListComponent,
  GalleryOptionsService,
  IMAGE_GALLERY_SERVICE_KEY,
} from '@myrmidon/cadmus-img-gallery';
import { DialogService } from '@myrmidon/ngx-mat-tools';

import {
  ChgcAnnotationPayload,
  ChgcListAnnotation,
  isSameGalleryImage,
  sameChgcAnnotations,
} from '../chgc-image-annotations';
import { ChgcImageAnnotationDialogComponent } from '../chgc-image-annotation-dialog/chgc-image-annotation-dialog.component';
import { ChgcImgAnnotationListComponent } from '../chgc-img-annotation-list/chgc-img-annotation-list.component';

/**
 * The default entries for the gallery filter, used when no entries
 * are specified.
 */
export const DEFAULT_CHGC_GALLERY_FILTER_ENTRIES: readonly GalleryFilterEntry[] =
  Object.freeze([{ id: 'title', value: 'title' }]);

const ANNOTATOR_TAB = 0;
const GALLERY_TAB = 1;

/**
 * The CHGC gallery image annotator. This orchestrates an image gallery,
 * where the user picks the image to annotate, an image annotator, and the
 * list of the annotations drawn on the image.
 *
 * The `annotations` model is the source of truth: it is pushed into the
 * annotations list whenever it changes, and it is updated (emitting
 * `annotationsChange`) whenever the user changes the annotations.
 */
@Component({
  selector: 'cadmus-chgc-gallery-img-annotator',
  templateUrl: './chgc-gallery-img-annotator.component.html',
  styleUrl: './chgc-gallery-img-annotator.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTabsModule,
    MatTooltipModule,
    ImgAnnotatorToolbarComponent,
    ImgAnnotatorDirective,
    GalleryListComponent,
    ChgcImgAnnotationListComponent,
  ],
})
export class ChgcGalleryImgAnnotatorComponent {
  private readonly _galleryService = inject(IMAGE_GALLERY_SERVICE_KEY);
  private readonly _options = inject(GalleryOptionsService);
  private readonly _dialogService = inject(DialogService);
  private readonly _annotatorDirective = viewChild(ImgAnnotatorDirective);
  private _destroyed = false;
  private _pickId = 0;

  /**
   * The gallery image to annotate.
   */
  public readonly image = model<GalleryImage | undefined>();

  /**
   * The annotations being edited.
   */
  public readonly annotations = model<ChgcListAnnotation[]>([]);

  /**
   * The entries for the gallery filter. When not set, the default entries
   * are used (`DEFAULT_CHGC_GALLERY_FILTER_ENTRIES`).
   */
  public readonly filterEntries = input<GalleryFilterEntry[] | null>();

  /**
   * True to disable editing.
   */
  public readonly disabled = input<boolean | undefined>(false);

  /**
   * The component used to edit annotations.
   */
  public readonly editorComponent = ChgcImageAnnotationDialogComponent;

  /**
   * The function used to summarize an annotation.
   */
  public readonly annotationToString = (a: ChgcListAnnotation): string =>
    a.payload?.eid || '';

  /**
   * The current drawing tool.
   */
  public readonly tool = signal<string>('rectangle');

  /**
   * The URI of the image being annotated.
   */
  public readonly imageUri = computed(() => this.image()?.uri || '');

  /**
   * The selected tab: the annotator when there is an image, else the
   * gallery. It is reset whenever the image changes.
   */
  public readonly tabIndex = linkedSignal<number>(() =>
    this.imageUri() ? ANNOTATOR_TAB : GALLERY_TAB,
  );

  /**
   * True while the image is being loaded.
   */
  public readonly imageLoading = signal<boolean>(false);

  /**
   * True while the picked image is being retrieved from the gallery.
   */
  public readonly picking = signal<boolean>(false);

  /**
   * The last error, if any.
   */
  public readonly error = signal<string | undefined>(undefined);

  /**
   * The annotator, available once the image has been loaded.
   */
  public readonly annotator = computed(() =>
    this._annotatorDirective()?.annotator(),
  );

  /**
   * The inner annotations list.
   */
  public readonly list = signal<
    ImgAnnotationList<ChgcAnnotationPayload> | undefined
  >(undefined);

  /**
   * The effective gallery filter entries.
   */
  public readonly safeFilterEntries = computed<GalleryFilterEntry[]>(() => {
    const entries = this.filterEntries();
    return entries?.length
      ? entries
      : [...DEFAULT_CHGC_GALLERY_FILTER_ENTRIES];
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => (this._destroyed = true));

    // a new image is going to be loaded
    effect(() => {
      const uri = this.imageUri();
      untracked(() => {
        this.imageLoading.set(!!uri);
        this.error.set(undefined);
      });
    });

    // push the annotations into the list whenever they change
    effect(() => {
      const list = this.list();
      const annotations = this.annotations();
      if (!list) {
        return;
      }
      untracked(() => {
        if (!sameChgcAnnotations(list.annotations(), annotations)) {
          list.setAnnotations(annotations);
        }
      });
    });

    // update the annotations whenever the user changes them in the list
    effect(() => {
      const list = this.list();
      if (!list) {
        return;
      }
      const current = list.annotations();
      untracked(() => {
        if (!sameChgcAnnotations(current, this.annotations())) {
          this.annotations.set(current);
        }
      });
    });
  }

  public onListInit(list: ImgAnnotationList<ChgcAnnotationPayload>): void {
    // fill the new list before exposing it, so that its initial (empty)
    // state is never mistaken for a user's change
    const annotations = this.annotations();
    if (!sameChgcAnnotations(list.annotations(), annotations)) {
      list.setAnnotations(annotations);
    }
    this.list.set(list);
  }

  public onImageLoad(): void {
    this.imageLoading.set(false);
  }

  public onImageError(): void {
    this.imageLoading.set(false);
    this.error.set(`Unable to load image ${this.imageUri()}`);
  }

  public showGallery(): void {
    this.tabIndex.set(GALLERY_TAB);
  }

  public showAnnotator(): void {
    this.tabIndex.set(ANNOTATOR_TAB);
  }

  /**
   * Handle the image picked from the gallery. The image is retrieved from
   * the gallery service, at the size defined by its options. If it is a
   * different image and there are annotations, the user is asked to
   * confirm, as annotations are removed when replacing the image.
   *
   * @param picked The image picked from the gallery.
   */
  public async onImagePick(picked: GalleryImage): Promise<void> {
    if (this.disabled()) {
      return;
    }
    const pickId = ++this._pickId;
    this.picking.set(true);
    this.error.set(undefined);

    let image: GalleryImage | null;
    try {
      image = await firstValueFrom(
        this._galleryService.getImage(picked.id, this._options.get()),
        { defaultValue: null },
      );
    } catch (error) {
      console.error('Error retrieving image ' + picked.id, error);
      image = null;
    } finally {
      if (pickId === this._pickId) {
        this.picking.set(false);
      }
    }
    // ignore stale results
    if (pickId !== this._pickId || this._destroyed) {
      return;
    }
    if (!image) {
      this.error.set(`Unable to retrieve image ${picked.title || picked.id}`);
      return;
    }

    // same image: just go back to the annotator
    if (isSameGalleryImage(image, this.image())) {
      this.showAnnotator();
      return;
    }

    // a different image: annotations would no longer match it
    if (this.annotations().length) {
      const confirmed = await firstValueFrom(
        this._dialogService.confirm(
          'Change Image',
          `Changing the image removes its ${this.annotations().length} ` +
            'annotation(s). Continue?',
        ),
        { defaultValue: false },
      );
      if (!confirmed || pickId !== this._pickId || this._destroyed) {
        return;
      }
      this.annotations.set([]);
    }
    this.image.set(image);
    this.showAnnotator();
  }
}
