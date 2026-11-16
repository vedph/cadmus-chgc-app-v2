import { Routes } from '@angular/router';

import { pendingChangesGuard } from '@myrmidon/cadmus-core';
import {
  CHGC_IMAGE_ANNOTATIONS_PART_TYPEID,
  ChgcImageAnnotationsPartFeatureComponent,
} from '@myrmidon/cadmus-part-chgc-image-annotations';

/**
 * The routes to the CHGC part editors. Lazy-load them under the
 * items/:iid/chgc path.
 */
export const CADMUS_PART_CHGC_PG_ROUTES: Routes = [
  {
    path: `${CHGC_IMAGE_ANNOTATIONS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: ChgcImageAnnotationsPartFeatureComponent,
    canDeactivate: [pendingChangesGuard],
  },
];
