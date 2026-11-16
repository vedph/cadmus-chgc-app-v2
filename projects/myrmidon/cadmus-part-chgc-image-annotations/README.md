# CadmusPartChgcImageAnnotations

📦 `@myrmidon/cadmus-part-chgc-image-annotations`

This library contains the Cadmus CHGC image annotations part. In CHGC, the annotation structure is very essential, as Cadmus here is used only to provide visual annotation to an existing TEI-based workflow.

All the components are standalone, `OnPush` and zoneless-ready: their state is in signals, and their forms are Angular signal forms. Styles use Angular Material M3 system tokens (`--mat-sys-*`), so they follow the app's light or dark theme.

## Model

The payload of each visual annotation (`ChgcAnnotationPayload`) just includes an identifier (`eid`), derived from a preexisting taxonomy (thesaurus `chgc-ids`), a human-friendly label for it, and an optional free text note.

The CHGC annotations part (`ChgcImageAnnotationsPart`, type ID `it.vedph.chgc.image-annotations`) has the annotated image (`image`) and a collection of CHGC image annotations (`annotations`), which extend `GalleryImageAnnotation` with this payload data:

- base data:
  - `id` (`string`)
  - `target` (`GalleryImage`):
    - `id` (`string`)
    - `uri` (`string`)
    - `title` (`string`)
    - `description` (`string?`)
  - `selector` (`string`): the Annotorious selector (JSON).
  - `notes` (`string[]?`)
  - `tags` (`string[]?`)
- payload-specific data:
  - `eid` (`string`)
  - `label` (`string?`)
  - `note` (`string?`)

Empty optional strings are saved as missing values.

In the editor, annotations are handled as `ListAnnotation<ChgcAnnotationPayload>` objects (aliased as `ChgcListAnnotation`), pairing the Annotorious annotation with its payload. These functions convert between the two forms:

- `chgcToListAnnotation(annotation)`: from the part's model to the editor's model.
- `listToChgcAnnotation(annotation, fallbackImage?)`: from the editor's model to the part's model.
- `sameChgcAnnotations(a, b)`: true if two sets of list annotations are the same CHGC annotations, ignoring any data added by Annotorious.

## Components

- `ChgcImageAnnotationComponent` (`cadmus-chgc-image-annotation`): the editor for a single annotation payload. Its ID lookup picks an entity ID from the `chgc-ids` thesaurus (a closed set coming from the TEI workflow), matching the typed text in any part of the entry (case-insensitive). As this editor is usually instantiated by the dialog service, it gets the thesaurus from `AnnotationThesauriService`, which loads it once (the part editor seeds it with the thesaurus it already loaded). Enter in a text input saves, when the editor is valid and changed.
  - ▶️ model `annotation` (`ChgcListAnnotation`): set to the edited annotation on save.
  - 🔥 `cancel`.
- `ChgcImageAnnotationDialogComponent`: dialog wrapper for `ChgcImageAnnotationComponent`. It receives the annotation as its dialog data, and closes with the edited annotation, or with nothing when the user discards the changes.
- `ChgcImgAnnotationListComponent` (`cadmus-chgc-img-annotation-list`): the list of CHGC image annotations, derived from `ImgAnnotationListComponent` (see [ngx-annotorious](https://github.com/vedph/ngx-annotorious)). Users can select, edit and remove annotations. Besides the base inputs, it has `disabled`.
- `ChgcGalleryImgAnnotatorComponent` (`cadmus-chgc-gallery-img-annotator`): the core annotator component, orchestrating an image gallery (`GalleryListComponent`), an image annotator (an image with the `imgAnnotator` directive) and the list of annotations (`ChgcImgAnnotationListComponent`).
  - ▶️ model `image` (`GalleryImage?`): the image to annotate. When the user picks an image from the gallery, it is retrieved from the gallery service at the size defined by the gallery options. When picking a different image while there are annotations, the user is asked to confirm, as these annotations are removed.
  - ▶️ model `annotations` (`ChgcListAnnotation[]`): the annotations. They are emitted whenever the user draws, moves, resizes, edits or removes an annotation.
  - ▶️ `filterEntries` (`GalleryFilterEntry[]?`): the gallery filter entries. When not set, the gallery can be filtered by title only (`DEFAULT_CHGC_GALLERY_FILTER_ENTRIES`).
  - ▶️ `disabled` (`boolean?`).
- `ChgcImageAnnotationsPartComponent` (`cadmus-chgc-image-annotations-part`): the part editor. Thesauri: `gallery-image-annotation-filters` (optional, the gallery filters), `chgc-ids` (the entity IDs). The part requires at least one annotation.
- `ChgcImageAnnotationsPartFeatureComponent`: the part editor feature, routed by [@myrmidon/cadmus-part-chgc-pg](../cadmus-part-chgc-pg/README.md).

## Requirements

The host app must provide:

- the gallery service and options (`IMAGE_GALLERY_SERVICE_KEY`, `IMAGE_GALLERY_OPTIONS_KEY` from `@myrmidon/cadmus-img-gallery`), e.g. with `SimpleIiifGalleryService` from `@myrmidon/cadmus-img-gallery-iiif`;
- the Annotorious styles (`node_modules/@annotorious/annotorious/dist/annotorious.css` in `angular.json` `styles`);
- optionally, `MAT_DIALOG_DEFAULT_OPTIONS` for the annotation editor dialog.
