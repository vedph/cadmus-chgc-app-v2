import { Component, Inject } from '@angular/core';

import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';

import { ListAnnotation } from '@myrmidon/ngx-annotorious';

import { ChgcAnnotationPayload } from '../chgc-image-annotations';
import { ChgcImageAnnotationComponent } from '../chgc-image-annotation/chgc-image-annotation.component';

@Component({
  selector: 'cadmus-chgc-image-annotation-dialog',
  templateUrl: './chgc-image-annotation-dialog.component.html',
  styleUrls: ['./chgc-image-annotation-dialog.component.css'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    ChgcImageAnnotationComponent,
  ],
})
export class ChgcImageAnnotationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ChgcImageAnnotationDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: ListAnnotation<ChgcAnnotationPayload>
  ) {}

  onCloseClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(annotation: ListAnnotation<ChgcAnnotationPayload>): void {
    this.dialogRef.close(annotation);
  }
}
