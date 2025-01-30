import {
  ChangeDetectorRef,
  Component,
  effect,
  Inject,
  model,
  OnDestroy,
  OnInit,
  output,
} from '@angular/core';
import { Subscription, take } from 'rxjs';

import {
  MAT_DIALOG_DEFAULT_OPTIONS,
  MatDialog,
  MatDialogConfig,
} from '@angular/material/dialog';

import { ImageAnnotation } from '@annotorious/annotorious';

import {
  GalleryImage,
  ImgAnnotationList,
  ListAnnotation,
  ImgAnnotatorToolbarComponent,
  ImgAnnotatorDirective,
} from '@myrmidon/ngx-annotorious';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  GalleryOptionsService,
  GalleryService,
  IMAGE_GALLERY_SERVICE_KEY,
  GalleryListComponent,
} from '@myrmidon/cadmus-img-gallery';

import { ChgcImageAnnotationDialogComponent } from '../chgc-image-annotation-dialog/chgc-image-annotation-dialog.component';
import { NgIf } from '@angular/common';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatTabGroup, MatTab } from '@angular/material/tabs';

import { ChgcAnnotationPayload } from '../chgc-image-annotations';
import { ChgcImgAnnotationListComponent } from '../chgc-img-annotation-list/chgc-img-annotation-list.component';

@Component({
  selector: 'cadmus-chgc-gallery-img-annotator',
  templateUrl: './chgc-gallery-img-annotator.component.html',
  styleUrls: ['./chgc-gallery-img-annotator.component.css'],
  imports: [
    NgIf,
    MatProgressBar,
    MatTabGroup,
    MatTab,
    ImgAnnotatorToolbarComponent,
    ImgAnnotatorDirective,
    ChgcImgAnnotationListComponent,
    GalleryListComponent,
  ],
})
export class ChgcGalleryImgAnnotatorComponent implements OnInit, OnDestroy {
  private _sub?: Subscription;
  private _list?: ImgAnnotationList<ChgcAnnotationPayload>;
  private _pendingAnnotations?: ListAnnotation<ChgcAnnotationPayload>[];
  private _dropNextInput?: boolean;

  public loading?: boolean;
  public entries: ThesaurusEntry[];
  public annotator?: any;
  public editorComponent = ChgcImageAnnotationDialogComponent;
  public tool: string = 'rectangle';
  public tabIndex: number = 0;

  public annotationToString: (
    a: ListAnnotation<ChgcAnnotationPayload>
  ) => string = (a: ListAnnotation<ChgcAnnotationPayload>) => {
    return a.payload?.eid || '';
  };

  /**
   * The gallery image to annotate.
   */
  public readonly image = model<GalleryImage>();
  /**
   * The annotations being edited.
   */
  public readonly annotations = model<ListAnnotation<ChgcAnnotationPayload>[]>(
    []
  );
  /**
   * Emitted when image changes.
   */
  public readonly imageChange = output<GalleryImage | undefined>();

  public imageAnnotations: ImageAnnotation[] = [];

  constructor(
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DEFAULT_OPTIONS) public dlgConfig: MatDialogConfig,
    @Inject(IMAGE_GALLERY_SERVICE_KEY)
    private _galleryService: GalleryService,
    private _options: GalleryOptionsService,
    private changeDetector: ChangeDetectorRef
  ) {
    // mock filter entries
    this.entries = [
      {
        id: 'title',
        value: 'title',
      },
      {
        id: 'dsc',
        value: 'description',
      },
    ];

    effect(() => {
      console.log('Image changed:', this.image());
      // this.loading = true;
      if (this.image()) {
        setTimeout(() => {
          this.tabIndex = 0;
        });
      }
    });

    // when annotations change, update the inner list
    effect(() => {
      if (this._dropNextInput) {
        this._dropNextInput = false;
        return;
      }
      this.setAnnotations(this.annotations());
    });
  }

  private setAnnotations(
    annotations: ListAnnotation<ChgcAnnotationPayload>[]
  ): void {
    if (!this.loading && this._list) {
      console.log('Setting annotations:', annotations);
      this._list.setAnnotations(annotations);
    } else if (annotations?.length) {
      console.log('Setting pending annotations:', annotations);
      this._pendingAnnotations = annotations;
    }
  }

  public ngOnInit(): void {
    if (!this.image()) {
      console.log('No image, setting tabIndex to 1');
      this.tabIndex = 1;
    }
  }

  public ngOnDestroy(): void {
    this._sub?.unsubscribe();
  }

  public onImageLoad(): void {
    console.log('Image loaded');
    this.loading = false;
    this.tabIndex = 0;

    setTimeout(() => {
      if (this._pendingAnnotations?.length) {
        console.log('Consuming pending annotations:', this._pendingAnnotations);
        this._list!.setAnnotations(this._pendingAnnotations);
        this._pendingAnnotations = undefined;
      }
    });
  }

  public onToolChange(tool: string): void {
    this.tool = tool;
  }

  public onAnnotatorInit(annotator: any) {
    setTimeout(() => {
      this.annotator = annotator;
      this.changeDetector.detectChanges();
    });
  }

  public onListInit(list: ImgAnnotationList<ChgcAnnotationPayload>) {
    console.log('List init', list);
    this._list = list;

    // emit annotations whenever they change
    this._sub?.unsubscribe();
    this._sub = this._list.annotations$.subscribe((annotations) => {
      if (this.image() && !this.loading) {
        if (this._list) {
          console.log('List annotations changed:', annotations);
          this.imageAnnotations = this._list
            .getAnnotations()
            .map((a) => a.value);
        }
        this._dropNextInput = true;
        this.annotations.set(annotations);
      }
    });
  }

  public onSelectionChanged(annotation?: ImageAnnotation) {
    this._list?.onSelectionChange(annotation);
  }

  public editAnnotation(annotation: ImageAnnotation): void {
    this._list?.editAnnotation(annotation);
  }

  public selectAnnotation(index: number): void {
    this._list?.selectAnnotationAt(index);
  }

  public removeAnnotation(index: number): void {
    this._list?.removeAnnotationAt(index);
  }

  public onCreateAnnotation(annotation: ImageAnnotation) {
    this._list?.onCreateAnnotation(annotation);
  }

  public onClickAnnotation(event: {
    annotation: ImageAnnotation;
    originalEvent: PointerEvent;
  }) {
    console.log('Clicked annotation:', event);
    // this._list?.editAnnotation(event.annotation);
  }

  public onDeleteAnnotation(annotation: ImageAnnotation) {
    this._list?.onDeleteAnnotation(annotation);
  }

  public clearAnnotations(): void {
    this._list?.clearAnnotations();
  }

  public onImagePick(image: GalleryImage): void {
    this._galleryService
      .getImage(image.id, this._options.get())
      .pipe(take(1))
      .subscribe((image) => {
        console.log('Image picked:', image);
        this.image.set(image!);
      });
    this.tabIndex = 1;
  }
}
