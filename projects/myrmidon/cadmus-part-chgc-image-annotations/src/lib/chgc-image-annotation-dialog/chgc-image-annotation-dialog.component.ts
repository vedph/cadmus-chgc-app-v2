import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

import { ChgcListAnnotation } from '../chgc-image-annotations';
import { ChgcImageAnnotationComponent } from '../chgc-image-annotation/chgc-image-annotation.component';

/**
 * Dialog wrapper for `ChgcImageAnnotationComponent`. It receives the list
 * annotation to edit as its data, and closes with the edited annotation,
 * or with no result when the user discards the changes.
 */
@Component({
  selector: 'cadmus-chgc-image-annotation-dialog',
  templateUrl: './chgc-image-annotation-dialog.component.html',
  styleUrl: './chgc-image-annotation-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogTitle, MatDialogContent, ChgcImageAnnotationComponent],
})
export class ChgcImageAnnotationDialogComponent {
  public readonly dialogRef = inject(
    MatDialogRef<ChgcImageAnnotationDialogComponent>,
  );
  public readonly data = inject<ChgcListAnnotation>(MAT_DIALOG_DATA);

  public onCloseClick(): void {
    this.dialogRef.close();
  }

  public onSaveClick(annotation: ChgcListAnnotation | undefined): void {
    this.dialogRef.close(annotation);
  }
}
