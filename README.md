# Cadmus CHGC App V2

This V2 repository is derived from the original, production [V1 CHGC app repository](https://github.com/vedph/cadmus-chgc-app) by replacing Annotorious V2 with V3 using [ngx-annotorious](https://github.com/vedph/ngx-annotorious). As such this is the first experimental Cadmus solution based on this component.

- [API](https://github.com/vedph/cadmus-chgc-api)

## Development

This is a **zoneless** Angular app using `OnPush` components with signal-based state and signal forms, based on the Cadmus v20 frontend packages. Its local libraries are:

- [@myrmidon/cadmus-part-chgc-image-annotations](projects/myrmidon/cadmus-part-chgc-image-annotations/README.md): the CHGC image annotations part and its editors.
- [@myrmidon/cadmus-part-chgc-pg](projects/myrmidon/cadmus-part-chgc-pg/README.md): the routes to the CHGC part editors.

Commands (this workspace uses [pnpm](https://pnpm.io)):

- `pnpm install`: install packages.
- `pnpm run build-lib`: build the local libraries into `dist/`. The app imports them from there, so build them before building or serving the app, and after any change to them. Note that `ng serve` does not detect changes in `dist/`: after rebuilding the libraries, stop it, delete `.angular/cache` and restart it.
- `pnpm start`: serve the app at <http://localhost:4200>. It expects the [API](https://github.com/vedph/cadmus-chgc-api) at the `apiUrl` set in `public/env.js`.
- `pnpm test`: run the unit tests of the libraries ([Vitest](https://vitest.dev)). Use `pnpm run test-ann` or `pnpm run test-pg` for a single library.

## Docker

🐋 Quick **Docker image** build:

1. `pnpm run build-lib`;
2. update version in `env.js` and then `ng build`;
3. `docker build . -t vedph2020/cadmus-chgc-app:5.0.0 -t vedph2020/cadmus-chgc-app:latest` (replace with the current version).

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

>As an alternative source you can use a Naples image (version `0.0.2-na`): <https://www.dante.unina.it/images/ms/CNMD0000263308/manifest.json>.
