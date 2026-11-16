import { GalleryImage } from '@myrmidon/ngx-annotorious';

import {
  buildChgcAnnotationBody,
  ChgcImageAnnotation,
  ChgcListAnnotation,
  chgcToListAnnotation,
  isSameGalleryImage,
  listToChgcAnnotation,
  sameChgcAnnotations,
} from './chgc-image-annotations';
import { createTestAnnotation } from './testing/fake-annotator';

const IMAGE: GalleryImage = {
  id: '1',
  uri: 'https://server.edu/iiif/abc/full/!1024,/0/default.jpg',
  title: 'page 1',
};

function chgc(id = 'a1', eid = 'alpha'): ChgcImageAnnotation {
  const value = createTestAnnotation(id);
  return {
    id,
    target: { ...IMAGE },
    selector: JSON.stringify(value.target.selector),
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
    expect(a.value.target.selector).toEqual(JSON.parse(source.selector));
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
      selector: JSON.stringify(source.value.target.selector),
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
