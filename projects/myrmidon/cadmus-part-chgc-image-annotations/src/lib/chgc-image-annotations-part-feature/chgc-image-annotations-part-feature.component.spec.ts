import { Component, input, model, output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { render } from '@testing-library/angular';
import { Subject } from 'rxjs';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { PartEditorService } from '@myrmidon/cadmus-state';

import { ChgcImageAnnotationsPartFeatureComponent } from './chgc-image-annotations-part-feature.component';
import { CHGC_IMAGE_ANNOTATIONS_PART_TYPEID } from '../chgc-image-annotations';

function makeRoute(): ActivatedRoute {
  return {
    snapshot: {
      params: { iid: 'item1', pid: 'part1' },
      routeConfig: { path: `${CHGC_IMAGE_ANNOTATIONS_PART_TYPEID}/:pid` },
      queryParams: {},
    },
  } as unknown as ActivatedRoute;
}

function makeEditorService() {
  return {
    loading$: new Subject<boolean>(),
    saving$: new Subject<boolean>(),
    load: vi.fn().mockResolvedValue(undefined),
    save: vi.fn(),
  };
}

@Component({ selector: 'cadmus-current-item-bar', template: '' })
class MockCurrentItemBarComponent {}

@Component({ selector: 'cadmus-chgc-image-annotations-part', template: '' })
class MockPartComponent {
  public readonly identity = input<unknown>();
  public readonly data = model<unknown>();
  public readonly editorClose = output();
  public readonly dirtyChange = output<boolean>();
}

describe('ChgcImageAnnotationsPartFeatureComponent', () => {
  it('should require the CHGC thesauri', () => {
    const feature = new ChgcImageAnnotationsPartFeatureComponent(
      { navigate: vi.fn() } as unknown as Router,
      makeRoute(),
      { open: vi.fn() } as unknown as MatSnackBar,
      {} as ItemService,
      {} as ThesaurusService,
      makeEditorService() as unknown as PartEditorService,
    );
    expect((feature as any).getReqThesauriIds()).toEqual([
      'gallery-image-annotation-filters',
      'chgc-ids',
    ]);
  });

  it('should render the part editor with the part identity', async () => {
    const editorService = makeEditorService();
    const { fixture } = await render(ChgcImageAnnotationsPartFeatureComponent, {
      componentImports: [MockCurrentItemBarComponent, MockPartComponent],
      providers: [
        { provide: ActivatedRoute, useValue: makeRoute() },
        { provide: ItemService, useValue: {} },
        { provide: ThesaurusService, useValue: {} },
        { provide: PartEditorService, useValue: editorService },
      ],
    });
    await fixture.whenStable();
    const part = fixture.debugElement.children
      .map((c) => c.componentInstance)
      .find((c) => c instanceof MockPartComponent) as MockPartComponent;
    expect(part).toBeTruthy();
    expect(part.identity()).toEqual(
      expect.objectContaining({
        itemId: 'item1',
        partId: 'part1',
        typeId: CHGC_IMAGE_ANNOTATIONS_PART_TYPEID,
      }),
    );
    expect(editorService.load).toHaveBeenCalled();
  });
});
