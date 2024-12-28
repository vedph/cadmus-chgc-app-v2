import { Component } from '@angular/core';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

import {
  ImgAnnotationListComponent,
  ObjectToStringPipe,
} from '@myrmidon/ngx-annotorious';

import { ChgcAnnotationPayload } from '../chgc-image-annotations';

@Component({
  selector: 'cadmus-chgc-img-annotation-list',
  templateUrl: './chgc-img-annotation-list.component.html',
  styleUrls: ['./chgc-img-annotation-list.component.css'],
  imports: [
    NgIf,
    NgFor,
    MatIconButton,
    MatTooltip,
    MatIcon,
    AsyncPipe,
    ObjectToStringPipe,
  ],
})
export class ChgcImgAnnotationListComponent extends
  ImgAnnotationListComponent<ChgcAnnotationPayload> {
  public selectAnnotation(annotation: any): void {
    this.list?.selectAnnotation(annotation);
  }

  public removeAnnotation(index: number): void {
    this.list?.removeAnnotationAt(index);
  }

  public editAnnotationAt(index: number): void {
    this.list?.editAnnotationAt(index);
  }

  public dumpAnnotation(annotation: any): void {
    if (annotation) {
      console.log(annotation);
    }
  }
}
