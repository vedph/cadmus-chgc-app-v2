# CadmusPartChgcImageAnnotations

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.0.

This library contains the Cadmus CHGC image annotations part. In CHGC, the annotation structure is very essential, as Cadmus here is used only to provide visual annotation to an existing TEI-based workflow.

The payload of each visual annotation (`ChgcAnnotationPayload`) just includes an identifier (`eid`), derived from a preexisting taxonomy, a human-friendly label for it, and an optional free text note.

The CHGC annotations part is just a collection of CHGC image annotations, which extend `GalleryImageAnnotation` with this payload data:

- base data:
  - id (`string`)
  - target (`GalleryImage`):
    - id (`string`)
    - uri (`string`)
    - title (`string`)
    - desccription (`string?`)
  - selector (`string`)
  - notes (`string[]?`)
  - tags (`string[]`)
- payload-specific data:
  - eid (`string`)
  - label (`string?`)
  - note (`string?`)

## Components

- `ChgImageAnnotation`: the editor for a single annotation payload. This uses a lookup service based on a set of preloaded thesauri to allow users pick an entity name from a closed set (this comes from the TEI workflow).
- `ChgImageAnnotationDialog`: dialog wrapper for `ChgcImageAnnotation`.
- `ChgcImgAnnotationListComponent`: component for the list of CHGC image annotations, extending `ImgAnnotationListComponent`.
- `ChgcGalleryImgAnnotatorComponent`: this is the core annotator component, orchestrating an image gallery (`GalleryListComponent`), an image annotator (an image with a directive), and a list of annotations (`ChgcImgAnnotationListComponent`).
