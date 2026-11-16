import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ImgAnnotationListComponent } from '@myrmidon/ngx-annotorious';

import { ChgcAnnotationPayload } from '../chgc-image-annotations';

/**
 * The list of CHGC image annotations. Bind it to the annotator, the editor
 * component and the image being annotated: the list then keeps in synch
 * with the shapes drawn on the image.
 */
@Component({
  selector: 'cadmus-chgc-img-annotation-list',
  templateUrl: './chgc-img-annotation-list.component.html',
  styleUrl: './chgc-img-annotation-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
})
export class ChgcImgAnnotationListComponent extends ImgAnnotationListComponent<ChgcAnnotationPayload> {
  /**
   * True to disable the editing actions.
   */
  public readonly disabled = input<boolean>(false);

  /**
   * Get the shape type of the specified annotation, if any.
   */
  protected getShapeType(index: number): string {
    const a = this.annotations()[index];
    const type = (a?.value?.target?.selector as { type?: string } | undefined)
      ?.type;
    return type ? type.toLowerCase() : '';
  }
}
