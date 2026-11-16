import { Component, input, output } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TextFieldModule } from '@angular/cdk/text-field';
import { FormField } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { ChgcImageAnnotationComponent } from './chgc-image-annotation.component';
import { AnnotationThesauriService } from './annotation-thesauri.service';
import {
  buildChgcAnnotationBody,
  ChgcListAnnotation,
} from '../chgc-image-annotations';
import { createTestAnnotation, flushPromises } from '../testing/fake-annotator';

@Component({
  selector: 'cadmus-refs-lookup',
  template: '',
})
class MockRefLookupComponent {
  public readonly label = input<string>();
  public readonly service = input<unknown>();
  public readonly item = input<unknown>();
  public readonly required = input<boolean>();
  public readonly options = input<unknown>();
  public readonly itemChange = output<unknown>();
}

const ENTRIES: ThesaurusEntry[] = [
  { id: 'alpha', value: 'alpha' },
  { id: 'beta', value: 'beta' },
];

function annotation(
  payload?: ChgcListAnnotation['payload'],
): ChgcListAnnotation {
  return {
    id: 'a1',
    image: { id: '1', uri: 'p1.jpg', title: 'p1' },
    value: createTestAnnotation('a1'),
    payload,
  };
}

async function setup(
  value: ChgcListAnnotation | undefined,
  entries: Promise<ThesaurusEntry[]> = Promise.resolve(ENTRIES),
) {
  const thesauri = { getThesaurusEntries: vi.fn().mockReturnValue(entries) };
  const result = await render(ChgcImageAnnotationComponent, {
    inputs: { annotation: value },
    componentImports: [
      FormField,
      TextFieldModule,
      MatButtonModule,
      MatFormFieldModule,
      MatIconModule,
      MatInputModule,
      MatTooltipModule,
      MockRefLookupComponent,
    ],
    providers: [{ provide: AnnotationThesauriService, useValue: thesauri }],
  });
  await flushPromises();
  await result.fixture.whenStable();
  const component = result.fixture.componentInstance;
  const saved = vi.fn();
  const cancelled = vi.fn();
  component.annotation.subscribe(saved);
  component.cancel.subscribe(cancelled);
  const lookup = result.fixture.debugElement.query(
    By.directive(MockRefLookupComponent),
  ).componentInstance as MockRefLookupComponent;
  return { ...result, component, thesauri, saved, cancelled, lookup };
}

function acceptButton(): HTMLButtonElement {
  return screen.getByRole('button', { name: 'accept changes' });
}

describe('ChgcImageAnnotationComponent', () => {
  it('should render no <form>', async () => {
    const { container } = await setup(annotation({ eid: 'alpha' }));
    expect(container.querySelector('form')).toBeNull();
  });

  it('should show the payload, pristine', async () => {
    const { component, lookup } = await setup(
      annotation({ eid: 'alpha', label: 'Alpha', note: 'a note' }),
    );
    expect(
      (screen.getByRole('textbox', { name: 'label' }) as HTMLInputElement)
        .value,
    ).toBe('Alpha');
    expect(
      (screen.getByRole('textbox', { name: 'note' }) as HTMLTextAreaElement)
        .value,
    ).toBe('a note');
    expect(lookup.item()).toEqual(ENTRIES[0]);
    expect(component.form().dirty()).toBe(false);
    expect(acceptButton().disabled).toBe(true);
  });

  it('should pass the thesaurus entries to the lookup', async () => {
    const { lookup, thesauri } = await setup(annotation({ eid: 'alpha' }));
    expect(thesauri.getThesaurusEntries).toHaveBeenCalledWith('chgc-ids');
    expect(lookup.options()).toEqual({ entries: ENTRIES });
  });

  it('should show an ID not found in the thesaurus', async () => {
    const { lookup } = await setup(annotation({ eid: 'gamma' }));
    expect(lookup.item()).toEqual({ id: 'gamma', value: 'gamma' });
  });

  it('should save the edited payload, keeping the body in synch', async () => {
    const { saved, lookup, fixture } = await setup(
      annotation({ eid: 'alpha', label: 'Alpha' }),
    );
    const user = userEvent.setup();
    lookup.itemChange.emit(ENTRIES[1]);
    const label = screen.getByRole('textbox', { name: 'label' });
    await user.clear(label);
    await user.type(label, '  Beta  ');
    await fixture.whenStable();
    expect(acceptButton().disabled).toBe(false);

    await user.click(acceptButton());

    expect(saved).toHaveBeenCalledTimes(1);
    const a = saved.mock.calls[0][0] as ChgcListAnnotation;
    expect(a.id).toBe('a1');
    expect(a.payload).toEqual({ eid: 'beta', label: 'Beta', note: undefined });
    expect(a.value.bodies).toEqual([buildChgcAnnotationBody('a1', 'beta')]);
    // the shape is untouched
    expect(a.value.target).toEqual(annotation().value.target);
  });

  it('should require the ID', async () => {
    const { component, fixture } = await setup(annotation());
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox', { name: 'label' }), 'x');
    await fixture.whenStable();
    expect(component.form().invalid()).toBe(true);
    expect(acceptButton().disabled).toBe(true);
  });

  it('should show the ID required error once touched', async () => {
    const { lookup, fixture } = await setup(annotation({ eid: 'alpha' }));
    expect(screen.queryByText('ID required')).toBeNull();
    lookup.itemChange.emit(null);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(screen.getByText('ID required')).toBeTruthy();
  });

  it('should emit cancel on discard', async () => {
    const { cancelled, saved } = await setup(annotation({ eid: 'alpha' }));
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'discard changes' }));
    expect(cancelled).toHaveBeenCalledTimes(1);
    expect(saved).not.toHaveBeenCalled();
  });

  it('should save on Enter only when dirty', async () => {
    const { saved, fixture } = await setup(annotation({ eid: 'alpha' }));
    const user = userEvent.setup();
    const label = screen.getByRole('textbox', { name: 'label' });
    await user.type(label, '{Enter}');
    expect(saved).not.toHaveBeenCalled();

    await user.type(label, 'A{Enter}');
    await fixture.whenStable();
    expect(saved).toHaveBeenCalledTimes(1);
    expect(
      (saved.mock.calls[0][0] as ChgcListAnnotation).payload?.label,
    ).toBe('A');
  });

  it('should show an error when the thesaurus cannot be loaded', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await setup(
      annotation({ eid: 'alpha' }),
      Promise.reject(new Error('network')),
    );
    expect(screen.getByRole('alert').textContent).toContain('chgc-ids');
  });
});
