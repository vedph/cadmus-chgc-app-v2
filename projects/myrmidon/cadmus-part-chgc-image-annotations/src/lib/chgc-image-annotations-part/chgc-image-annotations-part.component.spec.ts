import { Component, input, model } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TitleCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { AppRepository } from '@myrmidon/cadmus-state';
import { EditedObject, PartIdentity, ThesauriSet } from '@myrmidon/cadmus-core';
import {
  CloseSaveButtonsComponent,
  HelpLinkComponent,
} from '@myrmidon/cadmus-ui';
import { GalleryImage } from '@myrmidon/ngx-annotorious';

import { ChgcImageAnnotationsPartComponent } from './chgc-image-annotations-part.component';
import { AnnotationThesauriService } from '../chgc-image-annotation/annotation-thesauri.service';
import {
  CHGC_IMAGE_ANNOTATIONS_PART_TYPEID,
  ChgcImageAnnotation,
  ChgcImageAnnotationsPart,
  ChgcListAnnotation,
  chgcToListAnnotation,
} from '../chgc-image-annotations';
import { createTestAnnotation } from '../testing/fake-annotator';

@Component({
  selector: 'cadmus-chgc-gallery-img-annotator',
  template: '',
})
class MockGalleryImgAnnotatorComponent {
  public readonly image = model<GalleryImage | undefined>();
  public readonly annotations = model<ChgcListAnnotation[]>([]);
  public readonly filterEntries = input<unknown>();
  public readonly disabled = input<boolean | undefined>();
}

const IDENTITY: PartIdentity = {
  itemId: 'item1',
  typeId: CHGC_IMAGE_ANNOTATIONS_PART_TYPEID,
  partId: 'part1',
  roleId: null,
};

const IMAGE: GalleryImage = { id: '1', uri: 'p1.jpg', title: 'page 1' };

function chgc(id: string, eid: string, x = 10): ChgcImageAnnotation {
  return {
    id,
    target: { ...IMAGE },
    selector: `xywh=pixel:${x},10,10,10`,
    eid,
  };
}

// an annotation as saved by previous versions of the editor
function legacyChgc(id: string, eid: string, x = 10): ChgcImageAnnotation {
  return {
    ...chgc(id, eid, x),
    selector: JSON.stringify(
      createTestAnnotation(id, undefined, x).target.selector,
    ),
  };
}

function makeData(
  annotations: ChgcImageAnnotation[] = [chgc('a', 'alpha')],
  thesauri: ThesauriSet = {},
): EditedObject<ChgcImageAnnotationsPart> {
  return {
    value: {
      id: 'part1',
      itemId: 'item1',
      typeId: CHGC_IMAGE_ANNOTATIONS_PART_TYPEID,
      roleId: undefined,
      timeCreated: new Date(0),
      creatorId: 'u',
      timeModified: new Date(0),
      userId: 'u',
      image: { ...IMAGE },
      // copies, so that no form tag leaks into the shared data
      annotations: structuredClone(annotations),
    },
    thesauri,
  };
}

async function setup(
  data?: EditedObject<ChgcImageAnnotationsPart>,
  roles: string[] = ['editor'],
) {
  const user = { userName: 'u', email: 'u@x.org', roles, emailConfirmed: true };
  const thesauri = { setThesaurus: vi.fn() };
  const result = await render(ChgcImageAnnotationsPartComponent, {
    inputs: { identity: IDENTITY, data },
    componentImports: [
      TitleCasePipe,
      MatCardModule,
      MatIconModule,
      CloseSaveButtonsComponent,
      HelpLinkComponent,
      MockGalleryImgAnnotatorComponent,
    ],
    providers: [
      {
        provide: AuthJwtService,
        useValue: { currentUser$: of(user), currentUserValue: user },
      },
      {
        provide: AppRepository,
        useValue: {
          getSettingFor: vi.fn().mockResolvedValue(undefined),
          getTypeThesaurus: vi.fn().mockReturnValue(undefined),
        },
      },
      { provide: AnnotationThesauriService, useValue: thesauri },
    ],
  });
  await result.fixture.whenStable();
  const component = result.fixture.componentInstance;
  const annotator = result.fixture.debugElement.query(
    By.directive(MockGalleryImgAnnotatorComponent),
  ).componentInstance as MockGalleryImgAnnotatorComponent;
  return { ...result, component, annotator, thesauri };
}

describe('ChgcImageAnnotationsPartComponent', () => {
  it('should render no <form>', async () => {
    const { container } = await setup(makeData());
    expect(container.querySelector('form')).toBeNull();
  });

  it('should bind the data to the annotator, pristine', async () => {
    const { component, annotator } = await setup(makeData());
    expect(annotator.image()).toEqual(IMAGE);
    expect(annotator.annotations()).toEqual([
      chgcToListAnnotation(chgc('a', 'alpha')),
    ]);
    expect(component.isDirty()).toBe(false);
  });

  it('should be invalid without annotations', async () => {
    const { component, fixture } = await setup(makeData([]));
    expect(component.form().invalid()).toBe(true);
    fixture.detectChanges();
    expect(screen.getByText(/at least one annotation/i)).toBeTruthy();
  });

  it('should stay pristine when the annotator echoes its annotations', async () => {
    const { component, annotator, fixture } = await setup(makeData());
    // e.g. the annotations as returned by Annotorious, with extra data
    const echoed = annotator.annotations().map((a) => ({
      ...a,
      value: {
        ...a.value,
        target: { ...a.value.target, created: new Date() } as any,
      },
    }));
    annotator.annotations.set(echoed);
    annotator.image.set({ ...IMAGE });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.isDirty()).toBe(false);
  });

  it('should get dirty when the user changes the annotations', async () => {
    const { component, annotator, fixture } = await setup(makeData());
    annotator.annotations.set([
      ...annotator.annotations(),
      chgcToListAnnotation(chgc('b', 'beta')),
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.isDirty()).toBe(true);
    expect(component.form.annotations().value().map((a) => a.id)).toEqual([
      'a',
      'b',
    ]);
  });

  it('should get dirty when the user changes the image', async () => {
    const { component, annotator, fixture } = await setup(makeData());
    annotator.image.set({ id: '2', uri: 'p2.jpg', title: 'page 2' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.isDirty()).toBe(true);
    expect(component.image()?.id).toBe('2');
  });

  it('should save the annotations without form tags', async () => {
    const { component, annotator, fixture } = await setup(makeData());
    annotator.annotations.set([
      chgcToListAnnotation(chgc('a', 'alpha', 50)),
      chgcToListAnnotation(chgc('b', 'beta')),
    ]);
    fixture.detectChanges();
    await fixture.whenStable();

    const saved = vi.fn();
    component.data.subscribe(saved);
    await userEvent.setup().click(screen.getByRole('button', { name: /save/i }));
    await fixture.whenStable();

    expect(saved).toHaveBeenCalledTimes(1);
    const part = (saved.mock.calls[0][0] as EditedObject<ChgcImageAnnotationsPart>)
      .value!;
    expect(part.id).toBe('part1');
    expect(part.typeId).toBe(CHGC_IMAGE_ANNOTATIONS_PART_TYPEID);
    expect(part.image).toEqual(IMAGE);
    expect(part.annotations).toEqual([chgc('a', 'alpha', 50), chgc('b', 'beta')]);
    for (const a of part.annotations) {
      expect(Object.getOwnPropertySymbols(a)).toEqual([]);
    }
    expect(component.isDirty()).toBe(false);
  });

  it('should load annotations with legacy selectors, pristine', async () => {
    const { component, annotator } = await setup(
      makeData([legacyChgc('a', 'alpha')]),
    );
    expect(annotator.annotations()).toEqual([
      chgcToListAnnotation(legacyChgc('a', 'alpha')),
    ]);
    expect(annotator.annotations()[0].value.target.selector?.type).toBe(
      'RECTANGLE',
    );
    expect(component.isDirty()).toBe(false);
  });

  it('should save legacy selectors in the format of the exporter', async () => {
    const { component, annotator, fixture } = await setup(
      makeData([legacyChgc('a', 'alpha')]),
    );
    annotator.annotations.set([
      ...annotator.annotations(),
      chgcToListAnnotation(chgc('b', 'beta', 50)),
    ]);
    fixture.detectChanges();
    await fixture.whenStable();

    const saved = vi.fn();
    component.data.subscribe(saved);
    await userEvent.setup().click(screen.getByRole('button', { name: /save/i }));
    await fixture.whenStable();

    const part = (saved.mock.calls[0][0] as EditedObject<ChgcImageAnnotationsPart>)
      .value!;
    expect(part.annotations.map((a) => a.selector)).toEqual([
      'xywh=pixel:10,10,10,10',
      'xywh=pixel:50,10,10,10',
    ]);
  });

  it('should seed the annotation thesauri with the IDs thesaurus', async () => {
    // the API returns thesaurus IDs with their language suffix
    const ids = { id: 'chgc-ids@en', language: 'en', entries: [] };
    const { thesauri } = await setup(makeData(undefined, { 'chgc-ids': ids }));
    expect(thesauri.setThesaurus).toHaveBeenCalledWith(ids, 'chgc-ids');
  });

  it('should pass the filter entries to the annotator', async () => {
    const entries = [{ id: 'title', value: 'Title' }];
    const { annotator } = await setup(
      makeData(undefined, {
        'gallery-image-annotation-filters': {
          id: 'gallery-image-annotation-filters',
          language: 'en',
          entries,
        },
      }),
    );
    expect(annotator.filterEntries()).toEqual(entries);
  });

  it('should disable the annotator for users who cannot edit', async () => {
    const { annotator } = await setup(makeData(), ['visitor']);
    expect(annotator.disabled()).toBe(true);
  });

  it('should enable the annotator for editors', async () => {
    const { annotator } = await setup(makeData());
    expect(annotator.disabled()).toBe(false);
  });
});
