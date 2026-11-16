import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  Inject,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';
import { take } from 'rxjs';

// material
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

// myrmidon
import { EnvService } from '@myrmidon/ngx-tools';
import { ThemeToggleComponent } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService, GravatarPipe, User } from '@myrmidon/auth-jwt-login';
import { GalleryOptionsService } from '@myrmidon/cadmus-img-gallery';

// cadmus
import { Thesaurus, ThesaurusEntry } from '@myrmidon/cadmus-core';
import { AppRepository } from '@myrmidon/cadmus-state';

import { ChgcGalleryOptions } from './gallery-options/gallery-options.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatTooltipModule,
    GravatarPipe,
    ThemeToggleComponent,
  ],
})
export class AppComponent implements OnInit {
  private readonly _authService = inject(AuthJwtService);
  private readonly _appRepository = inject(AppRepository);
  private readonly _router = inject(Router);
  private readonly _env = inject(EnvService);
  private readonly _destroyRef = inject(DestroyRef);

  // signals, so that changes made while the view is being checked (e.g. on
  // login) schedule a new check (zoneless app)
  public readonly user = signal<User | undefined>(undefined);
  public readonly logged = signal<boolean>(false);
  public readonly itemBrowsers = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  public readonly version = signal<string>(this._env.get('version') || '');

  public readonly isAdmin = computed(
    () => !!this.user()?.roles?.includes('admin'),
  );
  public readonly isEditor = computed(() => {
    const roles = this.user()?.roles || [];
    return roles.includes('admin') || roles.includes('editor');
  });

  /**
   * The ID of the current gallery images source.
   */
  private readonly _galleryOptions = inject(GalleryOptionsService);
  public readonly galleryId = computed(
    () =>
      (this._galleryOptions.options() as ChgcGalleryOptions)?.id || undefined,
  );

  public readonly branding = computed(() => {
    switch (this._env.get('branding')) {
      case 'staging':
        return {
          bg: 'var(--mat-sys-tertiary)',
          text: 'var(--mat-sys-on-tertiary)',
        };
      case 'dev':
        return {
          bg: 'var(--mat-sys-error)',
          text: 'var(--mat-sys-on-error)',
        };
      default: // production
        return {
          bg: 'var(--mat-sys-primary)',
          text: 'var(--mat-sys-on-primary)',
        };
    }
  });

  constructor(
    @Inject('itemBrowserKeys')
    private readonly _itemBrowserKeys: { [key: string]: string },
  ) {}

  public ngOnInit(): void {
    this.user.set(this._authService.currentUserValue || undefined);
    this.logged.set(this._authService.isAuthenticated(true));

    // when the user logs in or out, reload the app data
    this._authService.currentUser$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((user: User | null) => {
        this.logged.set(this._authService.isAuthenticated(true));
        this.user.set(user || undefined);
        if (user) {
          this._appRepository.load();
        }
      });

    // when the thesaurus is loaded, get the item browsers
    this._appRepository.itemBrowserThesaurus$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((thesaurus: Thesaurus | undefined) => {
        this.itemBrowsers.set(thesaurus ? thesaurus.entries : undefined);
      });
  }

  public getItemBrowserRoute(id: string): string {
    return this._itemBrowserKeys[id] || id;
  }

  public logout(): void {
    if (!this.logged()) {
      return;
    }
    this._authService
      .logout()
      .pipe(take(1))
      .subscribe(() => {
        this._router.navigate(['/home']);
      });
  }
}
