import { Component, input, output } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { render, screen } from '@testing-library/angular';
import { of, throwError } from 'rxjs';

import {
  GalleryImage,
  ImgAnnotationList,
  ImgAnnotatorDirective,
  ImgAnnotatorToolbarComponent,
} from '@myrmidon/ngx-annotorious';
import {
  GalleryFilterEntry,
  IMAGE_GALLERY_OPTIONS_KEY,
  IMAGE_GALLERY_SERVICE_KEY,
} from '@myrmidon/cadmus-img-gallery';
import { DialogService } from '@myrmidon/ngx-mat-tools';

import {
  ChgcGalleryImgAnnotatorComponent,
  DEFAULT_CHGC_GALLERY_FILTER_ENTRIES,
} from './chgc-gallery-img-annotator.component';
import { ChgcImgAnnotationListComponent } from '../chgc-img-annotation-list/chgc-img-annotation-list.component';
import {
  ChgcAnnotationPayload,
  ChgcListAnnotation,
} from '../chgc-image-annotations';
import {
  createTestAnnotation,
  FakeAnnotator,
  FakeDialog,
  flushPromises,
} from '../testing/fake-annotator';

@Component({
  selector: 'cadmus-gallery-list',
  template: '',
})
class MockGalleryListComponent {
  public readonly entries = input<GalleryFilterEntry[] | null>();
  public readonly selectedId = input<string | null>();
  public readonly imagePick = output<GalleryImage>();
}

const IMAGE1: GalleryImage = { id: '1', uri: 'p1.jpg', title: 'page 1' };
const IMAGE2: GalleryImage = { id: '2', uri: 'p2.jpg', title: 'page 2' };

function item(id: string, eid: string, x = 10): ChgcListAnnotation {
  return {
    id,
    image: { ...IMAGE1 },
    value: createTestAnnotation(id, undefined, x),
    payload: { eid },
  };
}

async function setup(inputs: Record<string, unknown> = {}) {
  const galleryService = {
    getImage: vi.fn((id: string) => of(id === '2' ? IMAGE2 : IMAGE1)),
  };
  const dialogService = { confirm: vi.fn().mockReturnValue(of(true)) };
  const dialog = new FakeDialog();
  const result = await render(ChgcGalleryImgAnnotatorComponent, {
    inputs,
    componentImports: [
      MatButtonModule,
      MatIconModule,
      MatProgressBarModule,
      MatTabsModule,
      MatTooltipModule,
      ImgAnnotatorToolbarComponent,
      ImgAnnotatorDirective,
      ChgcImgAnnotationListComponent,
      MockGalleryListComponent,
    ],
    providers: [
      { provide: IMAGE_GALLERY_SERVICE_KEY, useValue: galleryService },
      { provide: IMAGE_GALLERY_OPTIONS_KEY, useValue: { baseUri: '' } },
      { provide: DialogService, useValue: dialogService },
      { provide: MatDialog, useValue: dialog },
      // switch tabs synchronously (jsdom fires no animation events)
      { provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } },
    ],
  });
  const component = result.fixture.componentInstance;
  const annotationsChange = vi.fn();
  const imageChange = vi.fn();
  component.annotations.subscribe(annotationsChange);
  component.image.subscribe(imageChange);
  return {
    ...result,
    component,
    galleryService,
    dialogService,
    dialog,
    annotationsChange,
    imageChange,
  };
}

/**
 * Simulate the creation of the inner list, which happens once the annotator
 * is ready (i.e. once the image has been loaded, which never happens here).
 */
async function initList(
  component: ChgcGalleryImgAnnotatorComponent,
  dialog: FakeDialog,
  fixture: { whenStable(): Promise<unknown>; detectChanges(): void },
) {
  const annotator = new FakeAnnotator();
  const list = new ImgAnnotationList<ChgcAnnotationPayload>({
    annotator,
    editorComponent: class {},
    dialog: dialog.asDialog(),
    image: component.image(),
  });
  component.onListInit(list);
  fixture.detectChanges();
  await fixture.whenStable();
  return { annotator, list };
}

/**
 * Show the gallery tab (rendered lazily) and get its stub.
 */
async function gallery(fixture: any): Promise<MockGalleryListComponent> {
  fixture.componentInstance.showGallery();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture.debugElement.query(By.directive(MockGalleryListComponent))
    .componentInstance;
}

describe('ChgcGalleryImgAnnotatorComponent', () => {
  it('should start from the gallery when there is no image', async () => {
    const { component, fixture } = await setup();
    expect(component.tabIndex()).toBe(1);
    // the gallery gets the default filter entries
    expect((await gallery(fixture)).entries()).toEqual([
      ...DEFAULT_CHGC_GALLERY_FILTER_ENTRIES,
    ]);
  });

  it('should pass the filter entries to the gallery', async () => {
    const entries = [{ id: 'title', value: 'Title' }];
    const { fixture } = await setup({ filterEntries: entries });
    expect((await gallery(fixture)).entries()).toEqual(entries);
  });

  it('should show the image in the annotator', async () => {
    const { component, fixture } = await setup({ image: IMAGE1 });
    await fixture.whenStable();
    expect(component.tabIndex()).toBe(0);
    const img = screen.getByRole('img', { name: 'page 1' }) as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('p1.jpg');
    expect(component.imageLoading()).toBe(true);

    img.dispatchEvent(new Event('load'));
    expect(component.imageLoading()).toBe(false);
    expect((await gallery(fixture)).selectedId()).toBe('1');
  });

  it('should show an error when the image cannot be loaded', async () => {
    const { component, fixture } = await setup({ image: IMAGE1 });
    await fixture.whenStable();
    screen.getByRole('img', { name: 'page 1' }).dispatchEvent(new Event('error'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.imageLoading()).toBe(false);
    expect(screen.getByRole('alert').textContent).toContain('p1.jpg');
  });

  it('should fill the list with the annotations when it is created', async () => {
    const annotations = [item('a', 'alpha'), item('b', 'beta')];
    const { component, fixture, dialog, annotationsChange } = await setup({
      image: IMAGE1,
      annotations,
    });
    const { annotator, list } = await initList(component, dialog, fixture);

    expect(list.annotations().map((a) => a.id)).toEqual(['a', 'b']);
    expect([...annotator.annotations.keys()]).toEqual(['a', 'b']);
    // filling the list is not a user change
    expect(annotationsChange).not.toHaveBeenCalled();
  });

  it('should emit the annotations drawn by the user', async () => {
    const { component, fixture, dialog, annotationsChange } = await setup({
      image: IMAGE1,
    });
    const { annotator } = await initList(component, dialog, fixture);

    annotator.draw(createTestAnnotation('n'));
    dialog.close({ ...dialog.lastData, payload: { eid: 'new' } });
    await flushPromises();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(annotationsChange).toHaveBeenCalledTimes(1);
    const emitted = annotationsChange.mock.calls[0][0] as ChgcListAnnotation[];
    expect(emitted.map((a) => a.id)).toEqual(['n']);
    expect(emitted[0].payload).toEqual({ eid: 'new' });
    expect(emitted[0].image).toEqual(IMAGE1);
  });

  it('should emit the annotations moved by the user', async () => {
    const { component, fixture, dialog, annotationsChange } = await setup({
      image: IMAGE1,
      annotations: [item('a', 'alpha')],
    });
    const { annotator } = await initList(component, dialog, fixture);

    const moved = createTestAnnotation('a', undefined, 99);
    annotator.emit('updateAnnotation', moved, createTestAnnotation('a'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(annotationsChange).toHaveBeenCalledTimes(1);
    const emitted = annotationsChange.mock.calls[0][0] as ChgcListAnnotation[];
    expect(emitted[0].value.target).toEqual(moved.target);
  });

  it('should not reset the list when receiving equivalent annotations', async () => {
    const { component, fixture, dialog } = await setup({
      image: IMAGE1,
      annotations: [item('a', 'alpha')],
    });
    const { list } = await initList(component, dialog, fixture);
    const spy = vi.spyOn(list, 'setAnnotations');

    // e.g. the parent echoing back a converted copy
    fixture.componentRef.setInput('annotations', [item('a', 'alpha')]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should push new annotations into the list', async () => {
    const { component, fixture, dialog } = await setup({
      image: IMAGE1,
      annotations: [item('a', 'alpha')],
    });
    const { list, annotator } = await initList(component, dialog, fixture);

    fixture.componentRef.setInput('annotations', [item('b', 'beta')]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(list.annotations().map((a) => a.id)).toEqual(['b']);
    expect([...annotator.annotations.keys()]).toEqual(['b']);
  });

  it('should go back to the annotator when picking the same image', async () => {
    const { component, fixture, dialogService, imageChange } = await setup({
      image: IMAGE1,
      annotations: [item('a', 'alpha')],
    });
    (await gallery(fixture)).imagePick.emit({ ...IMAGE1, uri: 'thumb.jpg' });
    await flushPromises();

    expect(dialogService.confirm).not.toHaveBeenCalled();
    expect(imageChange).not.toHaveBeenCalled();
    expect(component.tabIndex()).toBe(0);
  });

  it('should set a picked image when there are no annotations', async () => {
    const { component, fixture, galleryService, dialogService, imageChange } =
      await setup();
    (await gallery(fixture)).imagePick.emit({ ...IMAGE2, uri: 'thumb.jpg' });
    await flushPromises();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(galleryService.getImage).toHaveBeenCalledWith('2', {
      baseUri: '',
    });
    expect(dialogService.confirm).not.toHaveBeenCalled();
    expect(imageChange).toHaveBeenCalledWith(IMAGE2);
    expect(component.tabIndex()).toBe(0);
  });

  it('should clear the annotations when the user confirms an image change', async () => {
    const { component, fixture, dialogService, annotationsChange, imageChange } =
      await setup({ image: IMAGE1, annotations: [item('a', 'alpha')] });
    (await gallery(fixture)).imagePick.emit(IMAGE2);
    await flushPromises();

    expect(dialogService.confirm).toHaveBeenCalledTimes(1);
    expect(annotationsChange).toHaveBeenCalledWith([]);
    expect(imageChange).toHaveBeenCalledWith(IMAGE2);
    expect(component.image()).toEqual(IMAGE2);
  });

  it('should keep image and annotations when the user does not confirm', async () => {
    const { component, fixture, dialogService, annotationsChange, imageChange } =
      await setup({ image: IMAGE1, annotations: [item('a', 'alpha')] });
    dialogService.confirm.mockReturnValue(of(false));
    (await gallery(fixture)).imagePick.emit(IMAGE2);
    await flushPromises();

    expect(annotationsChange).not.toHaveBeenCalled();
    expect(imageChange).not.toHaveBeenCalled();
    expect(component.image()).toEqual(IMAGE1);
  });

  it('should show an error when the picked image cannot be retrieved', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { component, fixture, galleryService, imageChange } = await setup();
    galleryService.getImage.mockReturnValue(
      throwError(() => new Error('network')),
    );
    (await gallery(fixture)).imagePick.emit(IMAGE2);
    await flushPromises();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.picking()).toBe(false);
    expect(imageChange).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toContain('page 2');
  });

  it('should not pick images when disabled', async () => {
    const { fixture, galleryService } = await setup({ disabled: true });
    (await gallery(fixture)).imagePick.emit(IMAGE2);
    await flushPromises();
    expect(galleryService.getImage).not.toHaveBeenCalled();
  });
});
