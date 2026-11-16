import { pendingChangesGuard } from '@myrmidon/cadmus-core';
import {
  CHGC_IMAGE_ANNOTATIONS_PART_TYPEID,
  ChgcImageAnnotationsPartFeatureComponent,
} from '@myrmidon/cadmus-part-chgc-image-annotations';

import { CADMUS_PART_CHGC_PG_ROUTES } from './cadmus-part-chgc-pg-routes';

describe('CADMUS_PART_CHGC_PG_ROUTES', () => {
  it('should define the image annotations part route', () => {
    const route = CADMUS_PART_CHGC_PG_ROUTES.find(
      (r) => r.path === `${CHGC_IMAGE_ANNOTATIONS_PART_TYPEID}/:pid`,
    );
    expect(route).toBeTruthy();
    expect(route!.pathMatch).toBe('full');
    expect(route!.component).toBe(ChgcImageAnnotationsPartFeatureComponent);
    expect(route!.canDeactivate).toEqual([pendingChangesGuard]);
  });

  it('should define exactly one route', () => {
    expect(CADMUS_PART_CHGC_PG_ROUTES.length).toBe(1);
  });
});
