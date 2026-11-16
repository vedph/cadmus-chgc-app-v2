# CadmusPartChgcPg

📦 `@myrmidon/cadmus-part-chgc-pg`

The routes to the CHGC part editors, i.e. the editors of [@myrmidon/cadmus-part-chgc-image-annotations](../cadmus-part-chgc-image-annotations/README.md).

Lazy-load them in your app routes:

```ts
{
  path: 'items/:iid/chgc',
  loadChildren: () =>
    import('@myrmidon/cadmus-part-chgc-pg').then(
      (module) => module.CADMUS_PART_CHGC_PG_ROUTES,
    ),
  canActivate: [jwtGuard],
},
```

Each route targets a part editor feature component by its part type ID (`{typeId}/:pid`), and is guarded by `pendingChangesGuard`, which asks for confirmation before leaving an editor with unsaved changes.

>Before version 3, this library exported the `CadmusPartChgcPgModule` NgModule, which has been removed.
