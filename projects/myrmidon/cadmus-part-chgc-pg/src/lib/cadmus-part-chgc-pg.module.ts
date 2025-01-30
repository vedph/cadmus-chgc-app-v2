import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { PendingChangesGuard } from '@myrmidon/cadmus-core';

import {
  CHGC_IMAGE_ANNOTATIONS_PART_TYPEID,
  ChgcImageAnnotationsPartFeatureComponent,
} from '@myrmidon/cadmus-part-chgc-image-annotations';

// parts
export const RouterModuleForChild = RouterModule.forChild([
  {
    path: `${CHGC_IMAGE_ANNOTATIONS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: ChgcImageAnnotationsPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
]);

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // Cadmus
    RouterModuleForChild,
  ],
  exports: [],
})
export class CadmusPartChgcPgModule {}
