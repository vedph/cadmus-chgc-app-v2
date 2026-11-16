import { MatDialog } from '@angular/material/dialog';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { ImgAnnotationList } from '@myrmidon/ngx-annotorious';

import { ChgcImgAnnotationListComponent } from './chgc-img-annotation-list.component';
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

class EditorStub {}

const IMAGE = { id: '1', uri: 'p1.jpg', title: 'p1' };

function item(id: string, eid: string, label?: string): ChgcListAnnotation {
  return {
    id,
    image: IMAGE,
    value: createTestAnnotation(id),
    payload: { eid, label },
  };
}

async function setup(inputs: Record<string, unknown> = {}) {
  const annotator = new FakeAnnotator();
  const dialog = new FakeDialog();
  const listInit = vi.fn();
  const result = await render(ChgcImgAnnotationListComponent, {
    inputs: {
      annotator,
      editorComponent: EditorStub,
      image: IMAGE,
      annotationToString: (a: ChgcListAnnotation) => a.payload?.eid || '',
      ...inputs,
    },
    on: { listInit },
    providers: [{ provide: MatDialog, useValue: dialog }],
  });
  const list = listInit.mock.calls[0]?.[0] as
    | ImgAnnotationList<ChgcAnnotationPayload>
    | undefined;
  return { ...result, annotator, dialog, list };
}

describe('ChgcImgAnnotationListComponent', () => {
  it('should show the empty message', async () => {
    const { list } = await setup();
    expect(list).toBeInstanceOf(ImgAnnotationList);
    expect(screen.getByText(/no annotations/i)).toBeTruthy();
  });

  it('should render the annotations', async () => {
    const { list, fixture } = await setup();
    list!.setAnnotations([item('a', 'alpha', 'Alpha'), item('b', 'beta')]);
    fixture.detectChanges();
    await fixture.whenStable();

    const items = screen.getAllByRole('listitem');
    expect(items.length).toBe(2);
    expect(within(items[0]).getByText('alpha')).toBeTruthy();
    expect(within(items[0]).getByText('Alpha')).toBeTruthy();
    expect(within(items[0]).getByText('rectangle')).toBeTruthy();
    expect(within(items[1]).getByText('beta')).toBeTruthy();
  });

  it('should toggle the selection', async () => {
    const { list, fixture, annotator } = await setup();
    list!.setAnnotations([item('a', 'alpha')]);
    fixture.detectChanges();
    await fixture.whenStable();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { pressed: false }));
    await fixture.whenStable();
    expect(list!.selectedIndex()).toBe(0);
    expect(annotator.selected).toEqual(['a']);
    expect(screen.getByRole('listitem').classList).toContain('selected');

    await user.click(screen.getByRole('button', { pressed: true }));
    await fixture.whenStable();
    expect(list!.selectedIndex()).toBe(-1);
  });

  it('should remove an annotation', async () => {
    const { list, fixture, annotator } = await setup();
    list!.setAnnotations([item('a', 'alpha'), item('b', 'beta')]);
    fixture.detectChanges();
    await fixture.whenStable();

    await userEvent
      .setup()
      .click(screen.getAllByRole('button', { name: 'remove annotation' })[0]);
    await fixture.whenStable();

    expect(list!.annotations().map((a) => a.id)).toEqual(['b']);
    expect(annotator.annotations.has('a')).toBe(false);
  });

  it('should edit an annotation in the dialog', async () => {
    const { list, fixture, dialog } = await setup();
    list!.setAnnotations([item('a', 'alpha')]);
    fixture.detectChanges();
    await fixture.whenStable();

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'edit annotation' }));
    expect(dialog.opened[0].component).toBe(EditorStub);
    expect(dialog.lastData.payload).toEqual({ eid: 'alpha' });

    dialog.close({ ...dialog.lastData, payload: { eid: 'gamma' } });
    await flushPromises();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(list!.annotations()[0].payload).toEqual({ eid: 'gamma' });
    expect(screen.getByText('gamma')).toBeTruthy();
  });

  it('should disable the actions when disabled', async () => {
    const { list, fixture } = await setup({ disabled: true });
    list!.setAnnotations([item('a', 'alpha')]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(
      (
        screen.getByRole('button', {
          name: 'edit annotation',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(
      (
        screen.getByRole('button', {
          name: 'remove annotation',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });
});
