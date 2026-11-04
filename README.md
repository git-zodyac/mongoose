# @parziva-1/zod-mongoose

![CI](https://github.com/parziva-1/zod-mongoose/actions/workflows/ci.yml/badge.svg)
![NPM Version](https://img.shields.io/npm/v/%40parziva-1%2Fzod-mongoose)
![License](https://img.shields.io/npm/l/%40parziva-1%2Fzod-mongoose)
![Test coverage](https://raw.githubusercontent.com/parziva-1/zod-mongoose/main/badges/coverage.svg)

Convert [Zod](https://www.npmjs.com/package/zod) object schemas into
[Mongoose](https://www.npmjs.com/package/mongoose) schemas, keeping a single
source of truth for both runtime validation and your database layer.

## Why this fork exists

This is a fork of the excellent
[`@zodyac/zod-mongoose`](https://www.npmjs.com/package/@zodyac/zod-mongoose)
(upstream: [git-zodyac/mongoose](https://github.com/git-zodyac/mongoose)),
created to add **Zod v4 support**. As of this writing, upstream is still on
Zod v3 internals and has not published a v4-compatible release. This fork
ports the schema introspection layer to Zod v4's runtime shape
(`schema._zod.def`) while keeping the public API unchanged, so it's a drop-in
replacement once your own Zod schemas are upgraded to v4.

All credit for the original design and implementation goes to the upstream
`zodyac` project and its contributors (see [LICENSE](./LICENSE)).

## Installation

```bash
npm install @parziva-1/zod-mongoose
pnpm add @parziva-1/zod-mongoose
yarn add @parziva-1/zod-mongoose
bun add @parziva-1/zod-mongoose
```

Peer dependencies: `zod@^4.3.0` and `mongoose@^8.20.2 || ^9.0.0`. The package
is ESM-only and requires Node >= 20 (also works on Bun).

### Compatibility

| `@parziva-1/zod-mongoose` | Mongoose | Zod | Runtime |
| --- | --- | --- | --- |
| 5.x | 8.20.2 - 8.x (tested: 8.20.2, 8.24.8) | 4.3.0 - 4.x (tested: 4.3.x, 4.4.0, 4.6.7) | Node >= 20 (CI on Node 22), Bun 1.4 (smoke tested) |
| 5.x | 9.0.0 - 9.x (tested: 9.0.0, 9.11.4) | 4.3.0 - 4.x (tested: 4.3.x, 4.4.0, 4.6.7) | Node >= 20 (CI on Node 22), Bun 1.4 (smoke tested) |

CI runs the full suite against the latest Mongoose 8 and the latest Mongoose 9
on every push and PR. Zod 4.0 - 4.2 is **not** supported: `.unique()` /
`.sparse()` metadata is lost when chained with other builders on those
versions.

## Migrating from `@zodyac/zod-mongoose`

- **Package name**: import from `@parziva-1/zod-mongoose` instead of
  `@zodyac/zod-mongoose`.
- **Zod version**: you must be on `zod@^4.3.0`. Zod v3 is not supported at
  all - stay on the upstream package (or this fork's `4.x` line, if you need
  an intermediate step) until your schemas are migrated.
- **Module format**: this package is **ESM-only** starting with v5 (no CJS
  build). If you `require()` it from CommonJS, use a dynamic
  `await import("@parziva-1/zod-mongoose")` instead.
- **Public API is unchanged**: `zodSchema`, `zodSchemaRaw`, `extendZod`,
  `zId`, `zUUID`, `.unique()`, `.sparse()`, `.ref()`, `.refPath()` all keep
  their existing signatures.

See [CHANGELOG.md](./CHANGELOG.md) for the full list of changes.

## Quick start

First, extend Zod with `extendZod`, then create your Zod schema:

```typescript
import { z } from "zod";
import { extendZod, zId, zUUID } from "@parziva-1/zod-mongoose";

extendZod(z);

const zUser = z.object({
  name: z.string().min(3).max(255),
  age: z.number().min(18).max(100),
  active: z.boolean().default(false),
  access: z.enum(["admin", "user"]).default("user"),
  companyId: zId("Company"),
  wearable: zUUID(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.enum(["CA", "NY", "TX"]),
  }),
  tags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});
```

Then convert it to a Mongoose schema and connect a model:

```typescript
import { zodSchema } from "@parziva-1/zod-mongoose";
import { type HydratedDocument, type InferSchemaType, model } from "mongoose";

const schema = zodSchema(zUser);
const userModel = model("User", schema);

// Mongoose 8 and 9 typings work on the generated schema
type UserDoc = HydratedDocument<InferSchemaType<typeof schema>>;
```

That's it - now use your Mongoose model as usual:

```typescript
await userModel.find({ name: "John" });
```

The snippets above are exercised by `src/readme.spec.ts`, so they are verified
on every CI run.

For PATCH-style request bodies, `toPartialUpdateSchema(zUser)` returns a Zod
object where every field is optional and `.default()` values are stripped, so
omitted fields do not silently reset to their defaults.

> [!NOTE]
> `extendZod` should be called once for the whole application.

## Features

See [SUPPORTED.md](./SUPPORTED.md) for the full, authoritative type/feature
support matrix. Summary:

- Basic types (string, number, boolean, date)
- Nested objects, subdocuments, and arrays
- Tuples (`z.tuple()`, including `.rest()`), stored as a length/type-validated
  array
- Enums and native (TypeScript) enums
- Literals (`z.literal()`), including Zod v4's multi-value form
- Discriminated unions (`z.discriminatedUnion()`)
- Intersections (`z.intersection()`) of two object shapes, merged into one
  flat sub-schema
- Recursive / self-referencing schemas (`z.lazy()`)
- Fallback values (`z.catch()`)
- Default values (static and factory-function forms)
- Maps and records (records become `Map`)
- ObjectId and UUID, with `ref` / `refPath` support
- `ZodAny` and `ZodUnknown` as `SchemaTypes.Mixed`
- Validation via `.refine()` for String, Number, Date - including a
  refinement applied both before *and* after a single `.transform()`
- `.unique()` / `.sparse()` for String, Number, Date, ObjectId, and UUID
- `.transform()` / `z.preprocess()`

Known limitations: plain unions (`z.union()`) pick the first inner type
(Mongoose has no native union type), and intersections only support merging
two object-shape schemas - see [SUPPORTED.md](./SUPPORTED.md) for the full
matrix and the design notes behind each non-obvious mapping (tuples,
literals, discriminated unions, `z.lazy()`, `z.catch()`).

## Checking schemas

To make sure nothing is missing, inspect `Schema.obj`:

```typescript
// schema is a mongoose schema
console.log(schema.obj);
```

## Raw object

If you want the raw object produced from a Zod schema so you can modify it
before constructing the `Schema`, use `zodSchemaRaw`:

```typescript
import { extendZod, zodSchemaRaw } from "@parziva-1/zod-mongoose";
import { model, Schema } from "mongoose";
import { z } from "zod";

extendZod(z);

const schema = zodSchemaRaw(zUser);
schema.age.index = true;

const userModel = model(
  "User",
  new Schema(schema, {
    timestamps: true,
  }),
);
```

## ObjectID and UUID

Use `zId(ref?: string)` and `zUUID(ref?: string)` to describe ObjectID and
UUID fields, and to reference another collection:

```typescript
import { extendZod, zId, zUUID } from "@parziva-1/zod-mongoose";
import { z } from "zod";

extendZod(z);

const zUser = z.object({
  // Just the ID
  someId: zId(),
  wearable: zUUID(),

  // With reference
  companyId: zId("Company"), // equivalent to zId().ref("Company")
  facilityId: zId().ref("Facility"),
  device: zUUID("Device"), // equivalent to zUUID().ref("Device")
  badgeId: zUUID().ref("Badge"),

  // `refPath` support
  storeId: zId().refPath("store"),
  store: z.string(),
  proxyId: zUUID().refPath("proxy"),
  proxy: z.string(),
});
```

## Validation

Use Zod refinement to validate your Mongoose models:

```typescript
import { z } from "zod";
import { extendZod, zodSchema } from "@parziva-1/zod-mongoose";

extendZod(z);

const zUser = z.object({
  phone: z
    .string()
    .refine((v) => /^\d{3}-\d{3}-\d{4}$/.test(v), "Invalid phone number"),
});
```

## Unique fields

To make a String, Number, Date, ObjectId, or UUID field unique, call
`.unique()`:

```typescript
const zUser = z.object({
  phone: z.string().unique(),
});
```

## Sparse fields

To make a String, Number, Date, ObjectId, or UUID field sparse, call
`.sparse()`:

```typescript
const zUser = z.object({
  email: z.string().sparse(),
  // combine with unique:
  // email: z.string().unique().sparse(),
});
```

## Warnings

### ZodUnion types

Plain unions are not supported by Mongoose. A union field is converted to its
*first* inner type:

```typescript
const zUser = z.object({
  access: z.union([z.string(), z.number()]),
});

// Becomes:
// { access: { type: String } }
```

If you need every variant validated correctly, use `z.discriminatedUnion()`
instead - see below.

### ZodDiscriminatedUnion

`z.discriminatedUnion()` maps to `SchemaTypes.Mixed`, validated by re-parsing
the assigned value with the original discriminated-union schema itself
(Mongoose has no native way to represent a discriminated shape on a plain
nested field):

```typescript
const zEvent = z.object({
  payload: z.discriminatedUnion("type", [
    z.object({ type: z.literal("email"), address: z.string() }),
    z.object({ type: z.literal("sms"), phone: z.string() }),
  ]),
});
```

### ZodTuple

`z.tuple()` maps to a Mongoose array of `Mixed`, with a `validate` enforcing
exact arity (or a minimum arity, if you used `.rest()`) and the correct type
at each position:

```typescript
const zPoint = z.object({
  coords: z.tuple([z.number(), z.number()]),
});
```

### ZodIntersection

`z.intersection()` is supported only when merging two object-shape schemas -
the two shapes are flattened into one Mongoose sub-schema. Intersecting
non-object schemas (e.g. `z.string().and(z.number())`) throws, since there's
no sane flat-field representation for it.

### ZodLazy

`z.lazy()` supports recursive/self-referencing schemas (e.g. a comment with
nested replies of the same shape) by unrolling the recursive getter up to a
fixed depth (5 levels), then falling back to `Mixed` beyond that - Mongoose
has no native concept of an infinitely recursive embedded subdocument.

### ZodAny / ZodUnknown

Both are converted to `SchemaTypes.Mixed`. Prefer a more specific type when
possible.

### ZodRecord

`ZodRecord` is converted to `Map`. Prefer `z.map()` directly when possible.

## Documentation

- [SUPPORTED.md](./SUPPORTED.md) - supported types and features, design notes
- [CHANGELOG.md](./CHANGELOG.md) - release history

## Contributing

Feel free to open issues and pull requests!

- Fork the repository
- Install the [Biome](https://biomejs.dev/) VS Code extension
- Install dependencies: `npm install`
- Make your changes
- Run the full check suite: `npm run check` (lint, typecheck, test, build,
  attw, publint)
- Commit and push your changes
- Open a pull request

## License

MIT - see [LICENSE](./LICENSE). Includes the original upstream copyright
notice plus this fork's additions.
