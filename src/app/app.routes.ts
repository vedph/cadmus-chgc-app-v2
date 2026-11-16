import { Routes } from '@angular/router';

// myrmidon
import { jwtAdminGuard, jwtGuard } from '@myrmidon/auth-jwt-login';

// cadmus
import { editorGuard } from '@myrmidon/cadmus-api';
import { pendingChangesGuard } from '@myrmidon/cadmus-core';

// locals
import { HomeComponent } from './home/home.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { RegisterUserPageComponent } from './register-user-page/register-user-page.component';
import { ManageUsersPageComponent } from './manage-users-page/manage-users-page.component';

export const routes: Routes = [
  // local home
  { path: 'home', component: HomeComponent },
  // local auth
  { path: 'login', component: LoginPageComponent },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
  },
  {
    path: 'register-user',
    component: RegisterUserPageComponent,
    canActivate: [jwtAdminGuard],
  },
  {
    path: 'manage-users',
    component: ManageUsersPageComponent,
    canActivate: [jwtAdminGuard],
  },
  {
    path: 'demo/layers',
    loadComponent: () =>
      import('@myrmidon/cadmus-layer-demo').then(
        (module) => module.LayerDemoComponent,
      ),
  },
  // chgc
  {
    path: 'options',
    loadComponent: () =>
      import('./gallery-options/gallery-options.component').then(
        (module) => module.GalleryOptionsComponent,
      ),
    canActivate: [jwtGuard],
  },
  // export
  {
    path: 'export',
    loadComponent: () =>
      import('./export-group/export-group.component').then(
        (module) => module.ExportGroupComponent,
      ),
    canActivate: [jwtGuard],
  },
  // import
  {
    path: 'import/group',
    loadComponent: () =>
      import('./import-group/import-group.component').then(
        (module) => module.ImportGroupComponent,
      ),
    canActivate: [jwtGuard],
  },
  {
    path: 'import/thesauri',
    loadComponent: () =>
      import('./import-thesauri/import-thesauri.component').then(
        (module) => module.ImportThesauriComponent,
      ),
    canActivate: [jwtAdminGuard],
  },
  // cadmus - items
  {
    path: 'items/:id',
    loadComponent: () =>
      import('@myrmidon/cadmus-item-editor').then(
        (module) => module.ItemEditorComponent,
      ),
    canActivate: [jwtGuard],
    canDeactivate: [pendingChangesGuard],
  },
  {
    path: 'items',
    loadComponent: () =>
      import('@myrmidon/cadmus-item-list').then(
        (module) => module.ItemListComponent,
      ),
    canActivate: [jwtGuard],
  },
  {
    path: 'search',
    loadComponent: () =>
      import('@myrmidon/cadmus-item-search').then(
        (module) => module.ItemSearchComponent,
      ),
    canActivate: [jwtGuard],
  },
  // cadmus - thesauri
  {
    path: 'thesauri/:id',
    loadComponent: () =>
      import('@myrmidon/cadmus-thesaurus-editor').then(
        (module) => module.ThesaurusEditorFeatureComponent,
      ),
    canActivate: [editorGuard],
  },
  {
    path: 'thesauri',
    loadComponent: () =>
      import('@myrmidon/cadmus-thesaurus-list').then(
        (module) => module.ThesaurusListComponent,
      ),
    canActivate: [editorGuard],
  },
  // cadmus - flags
  {
    path: 'flags',
    loadComponent: () =>
      import('@myrmidon/cadmus-flags-pg').then(
        (module) => module.FlagsEditorFeatureComponent,
      ),
    canActivate: [jwtGuard],
  },
  // cadmus - parts
  {
    path: 'items/:iid/general',
    loadChildren: () =>
      import('@myrmidon/cadmus-part-general-pg').then(
        (module) => module.CADMUS_PART_GENERAL_PG_ROUTES,
      ),
    canActivate: [jwtGuard],
  },
  {
    path: 'items/:iid/philology',
    loadChildren: () =>
      import('@myrmidon/cadmus-part-philology-pg').then(
        (module) => module.CADMUS_PART_PHILOLOGY_PG_ROUTES,
      ),
    canActivate: [jwtGuard],
  },
  {
    path: 'items/:iid/chgc',
    loadChildren: () =>
      import('@myrmidon/cadmus-part-chgc-pg').then(
        (module) => module.CADMUS_PART_CHGC_PG_ROUTES,
      ),
    canActivate: [jwtGuard],
  },
  // cadmus - graph
  {
    path: 'graph',
    loadComponent: () =>
      import('@myrmidon/cadmus-graph-pg-ex').then(
        (module) => module.GraphEditorExFeatureComponent,
      ),
    canActivate: [jwtGuard],
  },
  // cadmus - preview
  {
    path: 'preview',
    loadChildren: () =>
      import('@myrmidon/cadmus-preview-pg').then(
        (module) => module.CADMUS_PART_PREVIEW_PG_ROUTES,
      ),
    canActivate: [jwtGuard],
  },
  // home
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  // fallback
  { path: '**', component: HomeComponent },
];
