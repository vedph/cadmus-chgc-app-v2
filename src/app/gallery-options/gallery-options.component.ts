import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormField, form, required } from '@angular/forms/signals';
import { take } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ThesaurusService } from '@myrmidon/cadmus-api';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { GalleryOptionsService } from '@myrmidon/cadmus-img-gallery';
import { SimpleIiifGalleryOptions } from '@myrmidon/cadmus-img-gallery-iiif';

/**
 * The CHGC gallery options: these are the IIIF gallery options plus
 * the ID of the images source, drawn from the chgc-gallery-sources
 * thesaurus.
 */
export interface ChgcGalleryOptions extends SimpleIiifGalleryOptions {
  id: string;
}

/**
 * The ID of the thesaurus listing the gallery sources. Each entry has
 * the source ID as its ID, and the manifest URI as its value.
 */
export const CHGC_GALLERY_SOURCES_THESAURUS_ID = 'chgc-gallery-sources';

@Component({
  selector: 'app-gallery-options',
  templateUrl: './gallery-options.component.html',
  styleUrl: './gallery-options.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTooltipModule,
  ],
})
export class GalleryOptionsComponent {
  private readonly _optService = inject(GalleryOptionsService);
  private readonly _router = inject(Router);

  public readonly sources = signal<ThesaurusEntry[]>([]);
  public readonly loading = signal<boolean>(true);
  public readonly error = signal<string | undefined>(undefined);

  /**
   * The ID of the current source.
   */
  public readonly currentId = computed(
    () => (this._optService.options() as ChgcGalleryOptions)?.id || '',
  );

  private readonly _draft = signal({ sourceId: this.currentId() });

  public readonly form = form(this._draft, (p) => {
    required(p.sourceId);
  });

  /**
   * The selected source entry.
   */
  public readonly selected = computed(() =>
    this.sources().find((e) => e.id === this.form.sourceId().value()),
  );

  constructor() {
    inject(ThesaurusService)
      .getThesaurus(CHGC_GALLERY_SOURCES_THESAURUS_ID)
      .pipe(take(1))
      .subscribe({
        next: (t) => {
          this.sources.set(t?.entries || []);
          this.loading.set(false);
        },
        error: (error) => {
          console.error(
            `Error loading thesaurus ${CHGC_GALLERY_SOURCES_THESAURUS_ID}`,
            error,
          );
          this.loading.set(false);
          this.error.set(
            `Unable to load the image sources (thesaurus ${CHGC_GALLERY_SOURCES_THESAURUS_ID}).`,
          );
        },
      });
  }

  public cancel(): void {
    this._router.navigate(['/items']);
  }

  public save(): void {
    const source = this.selected();
    if (this.form().invalid() || !source) {
      return;
    }
    this._optService.set({
      ...this._optService.get(),
      id: source.id,
      manifestUri: source.value,
    } as ChgcGalleryOptions);
    this._router.navigate(['/items']);
  }
}
