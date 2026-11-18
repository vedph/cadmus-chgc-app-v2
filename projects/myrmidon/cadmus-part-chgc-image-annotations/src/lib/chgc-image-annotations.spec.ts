import { Shape, ShapeType } from '@annotorious/annotorious';

import { GalleryImage } from '@myrmidon/ngx-annotorious';

import {
  buildChgcAnnotationBody,
  ChgcImageAnnotation,
  ChgcListAnnotation,
  chgcToListAnnotation,
  isSameGalleryImage,
  listToChgcAnnotation,
  parseChgcSelector,
  sameChgcAnnotations,
  serializeChgcSelector,
} from './chgc-image-annotations';
import { createTestAnnotation } from './testing/fake-annotator';

const IMAGE: GalleryImage = {
  id: '1',
  uri: 'https://server.edu/iiif/abc/full/!1024,/0/default.jpg',
  title: 'page 1',
};

// the selector corresponding to createTestAnnotation
const RECT_SELECTOR = 'xywh=pixel:10,10,10,10';

function chgc(id = 'a1', eid = 'alpha'): ChgcImageAnnotation {
  return {
    id,
    target: { ...IMAGE },
    selector: RECT_SELECTOR,
    eid,
    label: 'Alpha',
    note: 'a note',
  };
}

function listItem(id = 'a1', eid = 'alpha'): ChgcListAnnotation {
  return {
    id,
    image: { ...IMAGE },
    value: createTestAnnotation(id),
    payload: { eid, label: 'Alpha', note: 'a note' },
  };
}

describe('parseChgcSelector', () => {
  it('should parse a rectangle', () => {
    expect(parseChgcSelector('xywh=pixel:173,723,334,656.5')).toEqual({
      type: ShapeType.RECTANGLE,
      geometry: {
        x: 173,
        y: 723,
        w: 334,
        h: 656.5,
        rot: 0,
        bounds: { minX: 173, minY: 723, maxX: 507, maxY: 1379.5 },
      },
    });
  });

  it('should parse a polygon', () => {
    const shape = parseChgcSelector(
      '<svg><polygon points="10,20 30,40 50,5"></polygon></svg>',
    );
    expect(shape?.type).toBe(ShapeType.POLYGON);
    expect((shape?.geometry as any).points).toEqual([
      [10, 20],
      [30, 40],
      [50, 5],
    ]);
    expect(shape?.geometry.bounds).toEqual({
      minX: 10,
      minY: 5,
      maxX: 50,
      maxY: 40,
    });
  });

  it('should parse an ellipse', () => {
    const shape = parseChgcSelector(
      '<svg><ellipse cx="115.5" cy="506" rx="37.5" ry="72"></ellipse></svg>',
    );
    expect(shape?.type).toBe(ShapeType.ELLIPSE);
    expect(shape?.geometry).toMatchObject({
      cx: 115.5,
      cy: 506,
      rx: 37.5,
      ry: 72,
      bounds: { minX: 78, minY: 434, maxX: 153, maxY: 578 },
    });
  });

  it('should parse a legacy circle as an ellipse', () => {
    const shape = parseChgcSelector(
      '<svg><circle cx="100" cy="50" r="10"></circle></svg>',
    );
    expect(shape?.type).toBe(ShapeType.ELLIPSE);
    expect(shape?.geometry).toMatchObject({ cx: 100, cy: 50, rx: 10, ry: 10 });
  });

  it('should parse a legacy freehand path', () => {
    const shape = parseChgcSelector(
      '<svg><path d="M381 44 L382 46 L384 49"></path></svg>',
    );
    expect(shape?.type).toBe(ShapeType.POLYLINE);
    expect(shape?.geometry.bounds).toEqual({
      minX: 381,
      minY: 44,
      maxX: 384,
      maxY: 49,
    });
  });

  it('should parse a rotated rectangle', () => {
    const shape = parseChgcSelector(
      '<svg><rect x="10" y="5" width="20" height="10" ' +
        'transform="rotate(90 20 10)" /></svg>',
    );
    expect(shape?.type).toBe(ShapeType.RECTANGLE);
    expect((shape?.geometry as any).rot).toBeCloseTo(Math.PI / 2);
  });

  it('should parse a JSON-serialized shape', () => {
    const json = {
      type: 'RECTANGLE',
      geometry: {
        bounds: { minX: 173, minY: 723, maxX: 507, maxY: 1379 },
        rot: 0,
        x: 173,
        y: 723,
        w: 334,
        h: 656,
      },
    };
    expect(parseChgcSelector(JSON.stringify(json))).toEqual(json);
  });

  it.each([
    '',
    'nonsense',
    '{bad',
    '{}',
    'null',
    'xywh=pixel:1,2',
    '<svg><unknown /></svg>',
    '<svg><ellipse cx="1" /></svg>',
    '<svg><circle cx="1" /></svg>',
  ])('should return undefined for %j', (selector) => {
    expect(parseChgcSelector(selector)).toBeUndefined();
  });
});

describe('serializeChgcSelector', () => {
  it('should serialize a rectangle as a media fragment', () => {
    expect(
      serializeChgcSelector({
        type: ShapeType.RECTANGLE,
        geometry: {
          bounds: { minX: 173, minY: 723, maxX: 507, maxY: 1379 },
          rot: 0,
          x: 173,
          y: 723,
          w: 334,
          h: 656,
        },
      } as Shape),
    ).toBe('xywh=pixel:173,723,334,656');
  });

  it('should serialize an ellipse as the SVG expected by the exporter', () => {
    const selector = serializeChgcSelector({
      type: ShapeType.ELLIPSE,
      geometry: {
        cx: 100,
        cy: 50,
        rx: 10,
        ry: 5,
        bounds: { minX: 90, minY: 45, maxX: 110, maxY: 55 },
      },
    } as Shape);
    expect(selector).toBe('<svg><ellipse cx="100" cy="50" rx="10" ry="5" /></svg>');
  });

  it('should serialize a polygon as the SVG expected by the exporter', () => {
    const selector = serializeChgcSelector({
      type: ShapeType.POLYGON,
      geometry: {
        points: [
          [10, 20],
          [30, 40],
          [50, 5],
        ],
        bounds: { minX: 10, minY: 5, maxX: 50, maxY: 40 },
      },
    } as Shape);
    expect(selector).toBe('<svg><polygon points="10,20 30,40 50,5" /></svg>');
  });

  it('should keep the rotation of a rectangle', () => {
    const selector = serializeChgcSelector({
      type: ShapeType.RECTANGLE,
      geometry: {
        x: 10,
        y: 5,
        w: 20,
        h: 10,
        rot: Math.PI / 2,
        bounds: { minX: 15, minY: 0, maxX: 25, maxY: 20 },
      },
    } as Shape);
    expect(selector).toBe(
      '<svg><rect x="10" y="5" width="20" height="10" ' +
        'transform="rotate(90 20 10)" /></svg>',
    );
  });

  it('should not lose an unknown shape', () => {
    const shape = { type: 'OTHER', geometry: { a: 1 } } as unknown as Shape;
    const selector = serializeChgcSelector(shape);
    expect(JSON.parse(selector)).toEqual(shape);
  });

  it('should not throw without a shape', () => {
    expect(serializeChgcSelector(undefined)).toBe('null');
  });

  it.each([
    'xywh=pixel:173.5,723,334,656',
    '<svg><polygon points="10,20 30.5,40 50,5" /></svg>',
    '<svg><ellipse cx="100.25" cy="50" rx="10" ry="5" /></svg>',
    '<svg><rect x="10" y="5" width="20" height="10" transform="rotate(45 20 10)" /></svg>',
  ])('should round-trip %s', (selector) => {
    expect(serializeChgcSelector(parseChgcSelector(selector))).toBe(selector);
  });

  it('should convert a JSON-serialized rectangle', () => {
    const selector = JSON.stringify(
      createTestAnnotation('a').target.selector,
    );
    expect(serializeChgcSelector(parseChgcSelector(selector))).toBe(
      RECT_SELECTOR,
    );
  });
});

describe('buildChgcAnnotationBody', () => {
  it('should build a tagging body with an ID derived from the annotation', () => {
    const body = buildChgcAnnotationBody('a1', 'alpha');
    expect(body).toEqual({
      id: 'a1-eid',
      annotation: 'a1',
      type: 'TextualBody',
      value: 'alpha',
      purpose: 'tagging',
    });
  });
});

describe('chgcToListAnnotation', () => {
  it('should convert the annotation', () => {
    const source = chgc();
    const a = chgcToListAnnotation(source);
    expect(a.id).toBe('a1');
    expect(a.image).toEqual(IMAGE);
    expect(a.value.id).toBe('a1');
    expect(a.value.target.annotation).toBe('a1');
    expect(a.value.target.selector).toEqual(
      parseChgcSelector(source.selector),
    );
    expect(a.value.bodies).toEqual([buildChgcAnnotationBody('a1', 'alpha')]);
    expect(a.payload).toEqual({ eid: 'alpha', label: 'Alpha', note: 'a note' });
  });

  it('should be deterministic', () => {
    const source = chgc();
    expect(chgcToListAnnotation(source)).toEqual(chgcToListAnnotation(source));
  });

  it('should not share the target object with the source', () => {
    const source = chgc();
    const a = chgcToListAnnotation(source);
    a.image.title = 'changed';
    expect(source.target.title).toBe('page 1');
  });

  it('should map empty label and note to undefined', () => {
    const a = chgcToListAnnotation({ ...chgc(), label: '', note: '' });
    expect(a.payload!.label).toBeUndefined();
    expect(a.payload!.note).toBeUndefined();
  });

  it('should not throw on an invalid selector', () => {
    const a = chgcToListAnnotation({ ...chgc(), selector: '{bad' });
    expect(a.value.target.selector).toBeUndefined();
  });
});

describe('listToChgcAnnotation', () => {
  it('should convert the annotation', () => {
    const source = listItem();
    const a = listToChgcAnnotation(source);
    expect(a).toEqual({
      id: 'a1',
      target: IMAGE,
      selector: RECT_SELECTOR,
      eid: 'alpha',
      label: 'Alpha',
      note: 'a note',
    });
  });

  it('should trim and omit empty optional values', () => {
    const a = listToChgcAnnotation({
      ...listItem(),
      payload: { eid: ' alpha ', label: '  ', note: '' },
    });
    expect(a.eid).toBe('alpha');
    expect('label' in a).toBe(false);
    expect('note' in a).toBe(false);
  });

  it('should use the fallback image when the annotation has none', () => {
    const a = listToChgcAnnotation(
      { ...listItem(), image: { id: '', uri: '', title: '' } },
      IMAGE,
    );
    expect(a.target).toEqual(IMAGE);
  });

  it('should keep only the image metadata in the target', () => {
    const a = listToChgcAnnotation({
      ...listItem(),
      image: { ...IMAGE, width: 100, description: 'd' } as GalleryImage,
    });
    expect(a.target).toEqual({ ...IMAGE, description: 'd' });
  });

  it('should round-trip with chgcToListAnnotation', () => {
    const source = chgc();
    expect(listToChgcAnnotation(chgcToListAnnotation(source))).toEqual(source);
  });
});

describe('sameChgcAnnotations', () => {
  it('should be true for empty or missing sets', () => {
    expect(sameChgcAnnotations([], [])).toBe(true);
    expect(sameChgcAnnotations(undefined, [])).toBe(true);
    expect(sameChgcAnnotations(null, undefined)).toBe(true);
  });

  it('should be false for sets of different length', () => {
    expect(sameChgcAnnotations([listItem()], [])).toBe(false);
  });

  it('should ignore data added by Annotorious', () => {
    const a = listItem();
    const b = listItem();
    (b.value.target as any).creator = { id: 'x', isGuest: true };
    (b.value.target as any).created = new Date();
    b.value.bodies = [];
    expect(sameChgcAnnotations([a], [b])).toBe(true);
  });

  it('should find equal the same shape in different selector formats', () => {
    const current = chgcToListAnnotation(chgc());
    const legacy = chgcToListAnnotation({
      ...chgc(),
      selector: JSON.stringify(createTestAnnotation('a1').target.selector),
    });
    expect(sameChgcAnnotations([current], [legacy])).toBe(true);
  });

  it('should detect a changed shape', () => {
    const a = listItem();
    const b = { ...listItem(), value: createTestAnnotation('a1', undefined, 50) };
    expect(sameChgcAnnotations([a], [b])).toBe(false);
  });

  it('should detect a changed payload', () => {
    expect(
      sameChgcAnnotations([listItem('a1', 'alpha')], [listItem('a1', 'beta')]),
    ).toBe(false);
  });

  it('should detect a changed order', () => {
    expect(
      sameChgcAnnotations(
        [listItem('a1'), listItem('a2')],
        [listItem('a2'), listItem('a1')],
      ),
    ).toBe(false);
  });
});

describe('isSameGalleryImage', () => {
  it('should compare ID and URI', () => {
    expect(isSameGalleryImage(IMAGE, { ...IMAGE, title: 'x' })).toBe(true);
    expect(isSameGalleryImage(IMAGE, { ...IMAGE, uri: 'other' })).toBe(false);
    expect(isSameGalleryImage(IMAGE, { ...IMAGE, id: '2' })).toBe(false);
  });

  it('should handle missing images', () => {
    expect(isSameGalleryImage(undefined, null)).toBe(true);
    expect(isSameGalleryImage(IMAGE, undefined)).toBe(false);
    expect(isSameGalleryImage(undefined, IMAGE)).toBe(false);
  });
});
