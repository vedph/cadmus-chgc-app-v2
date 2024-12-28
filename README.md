# Cadmus CHGC App V2

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.5. This V2 repository is derived from the original, production [V1 CHGC app repository](https://github.com/vedph/cadmus-chgc-app) by replacing Annotorious V2 with V3 using [ngx-annotorious](https://github.com/vedph/ngx-annotorious). As such this is the first experimental Cadmus solution based on this new brick.

- [API](https://github.com/vedph/cadmus-chgc-api)

## Docker

🐋 Quick **Docker image** build:

1. `npm run build-lib`;
2. update version in `env.js` and then `ng build`;
3. `docker build . -t vedph2020/cadmus-chgc-app:2.0.7 -t vedph2020/cadmus-chgc-app:latest` (replace with the current version).

## IIIF

- reference website: <https://parker.stanford.edu/parker/catalog/xj710dc7305>
- manifest: <https://dms-data.stanford.edu/data/manifests/Parker/xj710dc7305/manifest.json>

Paths in manifest:

- list: `sequences[0]/canvases`
- resource: `images[0]/resource` with properties:
  - `@id` = URI, e.g. <https://stacks.stanford.edu/image/iiif/xj710dc7305/029_fob_TC_46/full/full/0/default.jpg>
  - `height`
  - `width`
- label: `label`

Quick reference for [IIIF pattern](https://iiif.io/api/image/3.0/#image-request-uri-syntax):

```txt
{baseURL}/{identifier}/{region}/{size}/{rotation}/{quality}.{format}
```

- baseURL: The URL of the IIIF image server
- identifier: The identifier of the image resource
- region: The region of the full image that should be returned
- size: The size of the returned image
- rotation: The rotation applied to the returned image
- quality: The quality of the returned image
- format: The format of the returned image

>As an alternatie source you can use a Naples image (version `0.0.2-na`): <https://www.dante.unina.it/images/ms/CNMD0000263308/manifest.json>.

## History

- 2024-12-28: ⚠️ V2 repository, starting from app version 4:
  - upgraded Angular and packages.
  - refactored to standalone.
  - replaced Annotorious V2 with V3 via [ngx-annotorious](https://github.com/vedph/ngx-annotorious).
- [V1 history](https://github.com/vedph/cadmus-chgc-app#history)
