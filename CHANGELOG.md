# History

## 5.0.2

- 2026-11-25:
  - updated packages.
  - 🆕 opted into help and history.

## 5.0.1

- 2026-11-18: fixes to `@myrmidon/cadmus-part-chgc-image-annotations` 3.1.0 (new peer dependency: `@annotorious/plugin-tools`):

- 🐛 annotator: restored round zones, missing since the move to Annotorious V3. A new ellipse tool comes from `@annotorious/plugin-tools`; hold Shift while drawing to get a circle. The plugin stylesheet is added to `angular.json`.
- 🐛 TEI export failed with `Invalid selector`: since the move to Annotorious V3, selectors were saved as JSON-serialized shapes, while the exporter expects `xywh=pixel:...` or `<svg>...`. Selectors are now saved in the exporter's format.
- 🐛 annotations saved by the first version of the app (`xywh=pixel:...`, `<svg>...`, including circles and freehand paths) could not be loaded in the editor, as selectors were always parsed as JSON. All the selector formats are now read, including the JSON one.

⚠️ Parts already saved with JSON selectors keep them until they are changed: exporting them requires `Cadmus.Chgc.Export` 5.0.1 in the API, which is also required to export rotated rectangles, and to keep the whole annotation GUID in TEI.

## 5.0.0

- 2026-11-16: ⚠️ migrated to the Cadmus v20 frontend and to [ngx-annotorious](https://github.com/vedph/ngx-annotorious) 2 (`@myrmidon/ngx-annotorious` 2, `@myrmidon/cadmus-img-gallery` 10, `@myrmidon/cadmus-img-gallery-iiif` 10). The app is now **zoneless**; all its components are `OnPush`, with their state in signals and their forms in Angular signal forms. Library versions: `@myrmidon/cadmus-part-chgc-image-annotations` 3.0.0, `@myrmidon/cadmus-part-chgc-pg` 3.0.0.

### Breaking changes

`@myrmidon/cadmus-part-chgc-pg`:

- ⚠️ the `CadmusPartChgcPgModule` NgModule was removed. Lazy-load the new `CADMUS_PART_CHGC_PG_ROUTES` instead, as for the other Cadmus v20 part libraries:

  ```ts
  loadChildren: () =>
    import('@myrmidon/cadmus-part-chgc-pg').then(
      (module) => module.CADMUS_PART_CHGC_PG_ROUTES,
    ),
  ```

`@myrmidon/cadmus-part-chgc-image-annotations`:

- ⚠️ `ChgcImageAnnotationsPartComponent` derives from the v20 `ModelEditorComponentBase`: its form is a signal form (`form.image`, `form.annotations`, holding the part's model), replacing the former `annotations` form control; it renders no `<form>`, and saves via the close/save buttons.
- ⚠️ `ChgcGalleryImgAnnotatorComponent` no longer forwards the Annotorious events to the list, which now subscribes to them by itself (ngx-annotorious 2). Its public handlers (`onCreateAnnotation`, `onDeleteAnnotation`, `onSelectionChanged`, `onClickAnnotation`, `onAnnotatorInit`, `onToolChange`, `editAnnotation`, `selectAnnotation`, `removeAnnotation`, `clearAnnotations`) and properties (`loading`, `entries`, `dialog`, `dlgConfig`, `imageAnnotations`) were removed. Its state is in signals (`tool`, `tabIndex`, `imageLoading`, `picking`, `error`, `annotator`, `list`); new inputs: `filterEntries` and `disabled`.
- ⚠️ `ChgcImgAnnotationListComponent`: removed `selectAnnotation`, `removeAnnotation`, `editAnnotationAt` and the debug `dumpAnnotation`; it uses the protected helpers of the base `ImgAnnotationListComponent` (`toggleSelection`, `editAnnotationAt`, `removeAnnotationAt`). New input: `disabled`.
- ⚠️ `ChgcImageAnnotationComponent`: its form is a signal form (`form.eid`, `form.label`, `form.note`), replacing the former `eid`, `label`, `note` controls; `idEntries` is a signal.
- ⚠️ `IdLookupService` implements the v11 `RefLookupService` (new `id` and `getById`), and gets its entries from its `entries` property or from the lookup options.
- ⚠️ the conversion between the part's model and the editor's model, formerly private to the part editor, is now done by the exported functions `chgcToListAnnotation` and `listToChgcAnnotation`.
- the feature component uses `CurrentItemBarComponent` from `@myrmidon/cadmus-item-editor` (`@myrmidon/cadmus-ui-pg` was removed in Cadmus v20).

App:

- ⚠️ the Monaco editor is now `@jean-merelis/ngx-monaco-editor` (as in the Cadmus v20 shell), replacing `@cisstech/nge`. Monaco is served from `/vs` (see `assets` in `angular.json`).
- removed the dependencies no longer used: `zone.js`, `@angular/animations`, `@angular/platform-browser-dynamic`, `@cisstech/nge`, `@myrmidon/cadmus-ui-pg`; added `@jean-merelis/ngx-monaco-editor` and `@myrmidon/cadmus-ui-note-set` (required by the v20 general parts).
- tests run with [Vitest](https://vitest.dev) rather than Karma/Jasmine (`pnpm test`), using [Angular Testing Library](https://testing-library.com/docs/angular-testing-library/intro/) for UI components. The Karma stub specs were removed; as agreed, no specs are provided for the app pages.

### Fixes

- 🐛 annotations part:
  - moving or resizing a shape was not stored in the part: only drawing, deleting and editing an annotation were. Now any change to a shape makes the part dirty and is saved (via ngx-annotorious 2).
  - picking another image left the existing annotations in place, so that they were saved with the new image while their shapes referred to the old one. Now the user is asked to confirm, and the annotations are removed.
  - the gallery filter got hard-coded entries (title and description, the latter not supported by the IIIF gallery), ignoring the `gallery-image-annotation-filters` thesaurus loaded by the part. Now the thesaurus is used when present, and the default entries are limited to the title.
  - the Annotorious body of an annotation kept its original entity ID after the ID was edited; now it follows the edited ID.
  - empty labels and notes were saved as empty strings; they are now omitted, and the saved values are trimmed.
  - a thesaurus download error in the annotation editor went unhandled; now it is shown in the editor, and the failed download is retried the next time.
  - the "label too long" and "note too long" messages could never appear (wrong error key); they now do.
  - the annotation editor downloaded the `chgc-ids` thesaurus separately, although the part had already loaded it; now the part passes it to the editor's thesauri cache.
  - removed the pending annotations workarounds based on `setTimeout`, and the debug console output.
- 🐛 export TEI: the 50,000 characters limit on the XML also applied to the exported document, so that a large export made the form invalid, and could not be saved to a file. The exported XML has no client-side limit now.
- 🐛 import thesauri: with more than one option set (e.g. mode and dry run), the request URL was malformed, as each option was prefixed with `?`. Also, an upload error left the page in its uploading state forever; now the error is shown. The Excel options are sent only for Excel files, and file extensions are checked case-insensitively.
- 🐛 import TEI: the "too long" error messages could never appear (wrong error key); they now do.
- 🐛 home page: the banner image referred to a missing `banner-512.jpg` on small screens.
- 🐛 app bar: the logo image (`img/logo-white-40.png`) was missing; the bar no longer overflows narrow screens.

### Other changes

- general Cadmus pages (login, reset password, register user, manage users) copied from the reference Cadmus v20 app (`cadmus-ndp-app`), as well as the M3 theme (`styles.scss`, with the light/dark toggle and the semantic color classes) and the environment-branded app bar. All the styles use M3 system tokens (`--mat-sys-*`) instead of literal colors.
- routes use the v20 functional guards (`jwtGuard`, `jwtAdminGuard`, `editorGuard`, `pendingChangesGuard`); the CHGC pages (options, export, import) are lazy-loaded.
- revised layout of the image annotator: the image fills the available width, with the annotations list in a sticky side panel (stacked below the image on narrow screens); the image title, tool bar and "change image" button are above the image; loading and error states are shown.
- the current gallery source in the app bar links to the options page.
- library `package.json` files now declare all the packages they import as peer dependencies.

## 4.0.0

- 2024-12-28: ⚠️ V2 repository, starting from app version 4:
  - upgraded Angular and packages.
  - refactored to standalone.
  - replaced Annotorious V2 with V3 via [ngx-annotorious](https://github.com/vedph/ngx-annotorious).
- [V1 history](https://github.com/vedph/cadmus-chgc-app#history)
