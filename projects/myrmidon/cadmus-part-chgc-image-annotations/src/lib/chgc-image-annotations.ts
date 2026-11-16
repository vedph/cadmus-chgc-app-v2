import { ImageAnnotation } from '@annotorious/annotorious';

import { GalleryImage, ListAnnotation } from '@myrmidon/ngx-annotorious';
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
  extends GalleryImageAnnotation, ChgcAnnotationPayload {}

/**
 * The gallery image annotations part model.
 */
export interface ChgcImageAnnotationsPart extends Part {
  image?: GalleryImage;
  annotations: ChgcImageAnnotation[];
}

/**
 * A list annotation with a CHGC payload, as edited in the annotator.
 */
export type ChgcListAnnotation = ListAnnotation<ChgcAnnotationPayload>;

/**
 * The type ID used to identify the GalleryImageAnnotationsPart type.
 */
export const CHGC_IMAGE_ANNOTATIONS_PART_TYPEID =
  'it.vedph.chgc.image-annotations';

/**
 * The ID of the thesaurus with the entity IDs for annotations.
 */
export const CHGC_IDS_THESAURUS_ID = 'chgc-ids';

/**
 * The ID of the thesaurus with the gallery filter entries.
 */
export const CHGC_GALLERY_FILTERS_THESAURUS_ID =
  'gallery-image-annotation-filters';

const EMPTY_IMAGE: GalleryImage = Object.freeze({ id: '', uri: '', title: '' });

/**
 * Build the Annotorious body representing the entity ID of a CHGC annotation.
 * Annotorious requires annotations to have a body. Its ID is derived from the
 * annotation's ID, so that converting the same annotation always produces the
 * same body.
 *
 * @param annotationId The annotation ID.
 * @param eid The entity ID.
 * @returns The body.
 */
export function buildChgcAnnotationBody(
  annotationId: string,
  eid: string,
): ImageAnnotation['bodies'][number] {
  return {
    id: `${annotationId}-eid`,
    annotation: annotationId,
    type: 'TextualBody',
    value: eid,
    purpose: 'tagging',
  } as ImageAnnotation['bodies'][number];
}

/**
 * Convert a CHGC image annotation into a list annotation for the annotator.
 *
 * @param source The CHGC annotation.
 * @returns The list annotation.
 */
export function chgcToListAnnotation(
  source: ChgcImageAnnotation,
): ChgcListAnnotation {
  let selector: unknown;
  try {
    selector = JSON.parse(source.selector);
  } catch {
    selector = undefined;
  }
  return {
    id: source.id,
    image: { ...(source.target || EMPTY_IMAGE) },
    value: {
      id: source.id,
      target: {
        annotation: source.id,
        selector,
      },
      // we need a body for Annotorious to work
      bodies: [buildChgcAnnotationBody(source.id, source.eid)],
    } as ImageAnnotation,
    payload: {
      eid: source.eid,
      label: source.label || undefined,
      note: source.note || undefined,
    },
  };
}

/**
 * Convert a list annotation from the annotator into a CHGC image annotation.
 *
 * @param source The list annotation.
 * @param fallbackImage The image to use as the target, should the list
 * annotation have none.
 * @returns The CHGC annotation.
 */
export function listToChgcAnnotation(
  source: ChgcListAnnotation,
  fallbackImage?: GalleryImage | null,
): ChgcImageAnnotation {
  const image =
    source.image && (source.image.id || source.image.uri)
      ? source.image
      : fallbackImage || EMPTY_IMAGE;
  const target: GalleryImage = {
    id: image.id,
    uri: image.uri,
    title: image.title,
  };
  if (image.description) {
    target.description = image.description;
  }
  const annotation: ChgcImageAnnotation = {
    id: source.id,
    target,
    selector: JSON.stringify(source.value?.target?.selector ?? null),
    eid: source.payload?.eid?.trim() || '',
  };
  const label = source.payload?.label?.trim();
  if (label) {
    annotation.label = label;
  }
  const note = source.payload?.note?.trim();
  if (note) {
    annotation.note = note;
  }
  return annotation;
}

/**
 * True if the two sets of list annotations are equal as CHGC annotations,
 * i.e. they have the same IDs, shapes, targets and payloads. Any other
 * data added by Annotorious (e.g. creation date, creator) is ignored.
 */
export function sameChgcAnnotations(
  a: readonly ChgcListAnnotation[] | null | undefined,
  b: readonly ChgcListAnnotation[] | null | undefined,
): boolean {
  if (a === b) {
    return true;
  }
  if ((a?.length || 0) !== (b?.length || 0)) {
    return false;
  }
  if (!a?.length) {
    return true;
  }
  const ja = JSON.stringify(a.map((x) => listToChgcAnnotation(x)));
  const jb = JSON.stringify(b!.map((x) => listToChgcAnnotation(x)));
  return ja === jb;
}

/**
 * True if the two images are the same image.
 */
export function isSameGalleryImage(
  a: GalleryImage | null | undefined,
  b: GalleryImage | null | undefined,
): boolean {
  if (!a || !b) {
    return !a && !b;
  }
  return a.id === b.id && a.uri === b.uri;
}

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
