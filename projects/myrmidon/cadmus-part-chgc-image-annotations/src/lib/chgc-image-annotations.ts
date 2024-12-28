import { GalleryImage } from '@myrmidon/ngx-annotorious';
import { Part } from '@myrmidon/cadmus-core';
import { GalleryImageAnnotation } from '@myrmidon/cadmus-img-gallery';

/**
 * The payload of a CHGC image annotation. This is used as part of an
 * editing model (the T in ListAnnotation<T>), including both the original
 * Annotorious annotation and this payload.
 */
export interface ChgcAnnotationPayload {
  eid: string;
  label?: string;
  note?: string;
}

/**
 * The CHGC image annotation as the component of a CHGC
 * image annotations part.
 */
export interface ChgcImageAnnotation
  extends GalleryImageAnnotation,
    ChgcAnnotationPayload {
}

/**
 * The gallery image annotations part model.
 */
export interface ChgcImageAnnotationsPart extends Part {
  image?: GalleryImage;
  annotations: ChgcImageAnnotation[];
}

/**
 * The type ID used to identify the GalleryImageAnnotationsPart type.
 */
export const CHGC_IMAGE_ANNOTATIONS_PART_TYPEID =
  'it.vedph.chgc.image-annotations';

/**
 * JSON schema for the GalleryImageAnnotations part.
 * You can use the JSON schema tool at https://jsonschema.net/.
 */
export const CHGC_IMAGE_ANNOTATIONS_PART_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id:
    'www.vedph.it/cadmus/parts/chgc/' +
    CHGC_IMAGE_ANNOTATIONS_PART_TYPEID +
    '.json',
  type: 'object',
  title: 'GalleryImageAnnotationsPart',
  required: [
    'id',
    'itemId',
    'typeId',
    'timeCreated',
    'creatorId',
    'timeModified',
    'userId',
    'annotations',
  ],
  properties: {
    timeCreated: {
      type: 'string',
      pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d+Z$',
    },
    creatorId: {
      type: 'string',
    },
    timeModified: {
      type: 'string',
      pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d+Z$',
    },
    userId: {
      type: 'string',
    },
    id: {
      type: 'string',
      pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
    },
    itemId: {
      type: 'string',
      pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
    },
    typeId: {
      type: 'string',
      pattern: '^[a-z][-0-9a-z._]*$',
    },
    roleId: {
      type: ['string', 'null'],
      pattern: '^([a-z][-0-9a-z._]*)?$',
    },
    image: {
      type: 'object',
      required: ['id', 'uri', 'title'],
      properties: {
        id: {
          type: 'string',
        },
        uri: {
          type: 'string',
        },
        title: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
      },
    },
    annotations: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'target', 'selector', 'eid'],
        properties: {
          id: {
            type: 'string',
          },
          target: {
            type: 'object',
            required: ['id', 'uri', 'title'],
            properties: {
              id: {
                type: 'string',
              },
              uri: {
                type: 'string',
              },
              title: {
                type: 'string',
              },
              description: {
                type: 'string',
              },
            },
          },
          selector: {
            type: 'string',
          },
          notes: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          tags: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          eid: {
            type: 'string',
          },
          label: {
            type: 'string',
          },
          note: {
            type: 'string',
          },
        },
      },
    },
  },
};
