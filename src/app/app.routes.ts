import { Routes } from '@angular/router';

import {
  AuthJwtAdminGuardService,
  AuthJwtGuardService,
} from '@myrmidon/auth-jwt-login';

import { PendingChangesGuard } from '@myrmidon/cadmus-core';
import { EditorGuardService } from '@myrmidon/cadmus-api';

import { HomeComponent } from './home/home.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { RegisterUserPageComponent } from './register-user-page/register-user-page.component';
import { ManageUsersPageComponent } from './manage-users-page/manage-users-page.component';
import { GalleryOptionsComponent } from './gallery-options/gallery-options.component';
import { ExportGroupComponent } from './export-group/export-group.component';
import { ImportGroupComponent } from './import-group/import-group.component';
import { ImportThesauriComponent } from './import-thesauri/import-thesauri.component';

export const routes: Routes = [
  // local home
  { path: 'home', component: HomeComponent },
  // local auth
  { path: 'login', component: LoginPageComponent },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    canActivate: [AuthJwtGuardService],
  },
  {
    path: 'register-user',
    component: RegisterUserPageComponent,
    canActivate: [AuthJwtAdminGuardService],
  },
  {
    path: 'manage-users',
    component: ManageUsersPageComponent,
    canActivate: [AuthJwtAdminGuardService],
  },
  {
    path: 'demo/layers',
    loadComponent: () =>
      import('@myrmidon/cadmus-layer-demo').then(
        (module) => module.LayerDemoComponent
      ),
  },
  // chgc
  {
    path: 'options',
    component: GalleryOptionsComponent,
    canActivate: [AuthJwtGuardService],
  },
  // export
  {
    path: 'export',
    component: ExportGroupComponent,
    canActivate: [AuthJwtGuardService],
  },
  // import
  {
    path: 'import/group',
    component: ImportGroupComponent,
    canActivate: [AuthJwtGuardService],
  },
  {
    path: 'import/thesauri',
    component: ImportThesauriComponent,
    canActivate: [AuthJwtAdminGuardService],
  },
  // cadmus - items
  {
    path: 'items/:id',
    loadComponent: () =>
      import('@myrmidon/cadmus-item-editor').then(
        (module) => module.ItemEditorComponent
      ),
    canActivate: [AuthJwtGuardService],
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: 'items',
    loadComponent: () =>
      import('@myrmidon/cadmus-item-list').then(
        (module) => module.ItemListComponent
      ),
    canActivate: [AuthJwtGuardService],
  },
  {
    path: 'search',
    loadComponent: () =>
      import('@myrmidon/cadmus-item-search').then(
        (module) => module.ItemSearchComponent
      ),
    canActivate: [AuthJwtGuardService],
  },
  // cadmus - thesauri
  {
    path: 'thesauri/:id',
    loadComponent: () =>
      import('@myrmidon/cadmus-thesaurus-editor').then(
        (module) => module.ThesaurusEditorFeatureComponent
      ),
    canActivate: [EditorGuardService],
  },
  {
    path: 'thesauri',
    loadComponent: () =>
      import('@myrmidon/cadmus-thesaurus-list').then(
        (module) => module.ThesaurusListComponent
      ),
    canActivate: [EditorGuardService],
  },
  // cadmus - flags
  {
    path: 'flags',
    loadComponent: () =>
      import('@myrmidon/cadmus-flags-pg').then(
        (module) => module.FlagsEditorFeatureComponent
      ),
    canActivate: [AuthJwtGuardService],
  },
  // cadmus - parts
  {
    path: 'items/:iid/general',
    loadChildren: () =>
      import('@myrmidon/cadmus-part-general-pg').then(
        (module) => module.CadmusPartGeneralPgModule
      ),
    canActivate: [AuthJwtGuardService],
  },
  {
    path: 'items/:iid/philology',
    loadChildren: () =>
      import('@myrmidon/cadmus-part-philology-pg').then(
        (module) => module.CadmusPartPhilologyPgModule
      ),
    canActivate: [AuthJwtGuardService],
  },
  {
    path: 'items/:iid/chgc',
    loadChildren: () =>
      import('@myrmidon/cadmus-part-chgc-pg').then(
        (module) => module.CadmusPartChgcPgModule
      ),
    canActivate: [AuthJwtGuardService],
  },
  // cadmus - graph
  {
    path: 'graph',
    loadComponent: () =>
      import('@myrmidon/cadmus-graph-pg-ex').then(
        (module) => module.GraphEditorExFeatureComponent
      ),
    canActivate: [AuthJwtGuardService],
  },
  // cadmus - preview
  {
    path: 'preview',
    loadChildren: () =>
      import('@myrmidon/cadmus-preview-pg').then(
        (module) => module.CadmusPreviewPgModule
      ),
    canActivate: [AuthJwtGuardService],
  },
  // home
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  // fallback
  { path: '**', component: HomeComponent },
];
