import { IndexLookupDefinitions } from '@myrmidon/cadmus-core';
import { CHGC_IMAGE_ANNOTATIONS_PART_TYPEID } from '@myrmidon/cadmus-part-chgc-image-annotations';
import { METADATA_PART_TYPEID } from '@myrmidon/cadmus-part-general-ui';

export const INDEX_LOOKUP_DEFINITIONS: IndexLookupDefinitions = {
  // human-friendly ID for items
  item: {
    typeId: METADATA_PART_TYPEID,
    name: 'eid',
  },
  // gallery
  img_anno_eid: {
    typeId: CHGC_IMAGE_ANNOTATIONS_PART_TYPEID,
    name: 'eid',
  },
};
