---
"@parziva-1/zod-mongoose": patch
---

Verify and document support for Mongoose 9.11 and the latest Mongoose 8, and Zod 4.6. No runtime code changes were needed.

- CI now runs the full suite against the latest Mongoose 8 and the latest Mongoose 9.
- Raise the `zod` peer minimum from `^4.0.0` to `^4.3.0`: on Zod 4.0 - 4.2 the `.unique()` / `.sparse()` metadata is dropped when chained with other builders (the suite fails there). The `mongoose` peer range is unchanged (`^8.20.2 || ^9.0.0`, tested on 8.20.2, 8.24.8, 9.0.0 and 9.11.4).
- README: compatibility table, Mongoose 9 typings quick start (covered by `src/readme.spec.ts`), links to SUPPORTED.md and CHANGELOG; coverage badge uses an absolute URL so it renders on npm.
