import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs/operators';
import { ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AuthJwtService, GravatarPipe, User } from '@myrmidon/auth-jwt-login';
import { EnvService } from '@myrmidon/ngx-tools';
import {
  GalleryOptions,
  GalleryOptionsService,
} from '@myrmidon/cadmus-img-gallery';

import { Thesaurus, ThesaurusEntry } from '@myrmidon/cadmus-core';
import { AppRepository } from '@myrmidon/cadmus-state';

import { ChgcGalleryOptions } from './gallery-options/gallery-options.component';
//import '@angular/localize/init';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    GravatarPipe
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  private _authSub?: Subscription;
  private _brSub?: Subscription;

  public user?: User;
  public logged?: boolean;
  public itemBrowsers?: ThesaurusEntry[];
  public version: string;
  public galleryId?: string;

  constructor(
    @Inject('itemBrowserKeys')
    private _itemBrowserKeys: { [key: string]: string },
    private _authService: AuthJwtService,
    private _appRepository: AppRepository,
    private _router: Router,
    env: EnvService,
    options: GalleryOptionsService
  ) {
    this.version = env.get('version') || '';
    this.galleryId = (options.get() as ChgcGalleryOptions)?.id;
    options.select().subscribe((o: GalleryOptions) => {
      this.galleryId = (o as ChgcGalleryOptions)?.id;
    });
  }

  ngOnInit(): void {
    this.user = this._authService.currentUserValue || undefined;
    this.logged = this.user !== null;

    this._authSub = this._authService.currentUser$.subscribe(
      (user: User | null) => {
        this.logged = this._authService.isAuthenticated(true);
        this.user = user || undefined;
        if (user) {
          this._appRepository.load();
        }
      }
    );

    this._brSub = this._appRepository.itemBrowserThesaurus$.subscribe(
      (thesaurus: Thesaurus | undefined) => {
        this.itemBrowsers = thesaurus ? thesaurus.entries : undefined;
      }
    );
  }

  ngOnDestroy(): void {
    this._authSub?.unsubscribe();
    this._brSub?.unsubscribe();
  }

  public getItemBrowserRoute(id: string): string {
    return this._itemBrowserKeys[id] || id;
  }

  public logout(): void {
    if (!this.logged) {
      return;
    }
    this._authService
      .logout()
      .pipe(take(1))
      .subscribe((_) => {
        this._router.navigate(['/home']);
      });
  }
}
