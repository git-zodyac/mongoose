# List of supported types and features

This is the list of all enabled features and types in `zod-mongoose`. If there
is a feature or type you would like to see supported, please open an issue on
GitHub.

Please note that this list is not exhaustive and may change in the future. It
contains the features that are encountered the most, are uncontroversial and are
being tested.

## Tested versions

The suite runs in CI against the latest Mongoose 8.x and 9.x (locally verified:
8.20.2, 8.24.8, 9.0.0, 9.11.4) and Zod 4.3.0 through 4.6.7. Zod < 4.3 is not
supported (field metadata used by `.unique()` / `.sparse()` is dropped there).
See the compatibility table in [README.md](./README.md#compatibility).

## Full support

These types and features are fully supported and tested:

- ✅ Number (ZodNumber)
- ✅ String (ZodString)
- ✅ Boolean (ZodBoolean)
- ✅ Date (ZodDate)
- ✅ Null (ZodNull)
- ✅ Mixed (ZodAny, ZodUnknown)
- ✅ ObjectId (custom, `zId()`)
- ✅ UUID (custom, `zUUID()`)
- ✅ Nested objects and schemas (ZodObject)
- ✅ Arrays (ZodArray)
- ✅ Tuples (ZodTuple), including a `.rest()` element - see "Design notes"
  below for how this maps onto Mongoose
- ✅ Enums, including native (TypeScript) enums (ZodEnum)
- ✅ Literals (ZodLiteral), including Zod v4's multi-value form
  (`z.literal(["a", "b"])`) - see "Design notes" below
- ✅ Discriminated unions (ZodDiscriminatedUnion) - see "Design notes" below
- ✅ Intersections (ZodIntersection) of two object-shape schemas, merged into
  one flat Mongoose sub-schema
- ✅ Recursive / self-referencing schemas (`z.lazy()`), e.g. a comment type
  with nested replies of the same shape - see "Design notes" below for the
  depth cap
- ✅ Fallback values (`z.catch()`), both a static value and a function
  receiving the original failing input
- ✅ Default values (ZodDefault), both a static value and a factory function
  (`() => value`), re-evaluated on every access
- ✅ Maps (ZodMap) and Records (ZodRecord, converted to `Map`)
- ✅ ObjectId references (custom, `zId(ref)`)
- ✅ Optional fields (ZodOptional)
- ✅ Nullable fields (ZodNullable), including combined with `.optional()`
- ✅ `.transform()` and `z.preprocess()` (ZodPipe)
- ✅ Validation using refinement (`z.refine()`):
  - `String`,
  - `Number`,
  - `Date`
  - A refinement applied before AND after a single `.transform()` call is
    now **both** enforced (as a Mongoose `validate` array) - this used to be
    a known gap where only the pre-transform refinement survived.
- ✅ Unique:
  - `String`,
  - `Number`,
  - `Date`,
  - `ObjectId`,
  - `UUID`
- ✅ Sparse:
  - `String`,
  - `Number`,
  - `Date`,
  - `ObjectId`,
  - `UUID`

## Design notes

Some of the types above have no native Mongoose equivalent, so they're mapped
onto the closest sane representation rather than forced into something
Mongoose can't actually express:

- **Tuples**: stored as a Mongoose array of `Mixed` (Mongoose arrays are
  homogeneous and unbounded) with a `validate` enforcing the tuple's real
  contract - exact arity (or a minimum arity plus a `.rest()` type), and the
  correct type at each position. The per-position checks reuse the original
  Zod item schemas' own `.safeParse()`.
- **Literals**: all-string values map to `String` with Mongoose's native
  `enum`; all-number / all-boolean values map to that primitive plus a
  `validate` enforcing membership (Mongoose has no non-string `enum`);
  anything else (mixed types, or types with no Mongoose primitive, e.g.
  `bigint`) maps to `Mixed` plus the same membership `validate`.
- **Discriminated unions**: Mongoose's own "discriminator" feature only
  applies to top-level models / array subdocuments, not to an arbitrary
  object-valued field, so there's no native fit. The field is mapped to
  `Mixed` and validated by re-parsing with the original discriminated-union
  schema's own `.safeParse()`, which already implements "dispatch on the
  discriminant, validate against the matching variant" correctly.
- **Recursive schemas (`z.lazy()`)**: Mongoose has no concept of an
  infinitely recursive embedded subdocument, so a self-referencing schema is
  unrolled by repeatedly calling its `z.lazy()` getter, capped at 5
  recursions per distinct getter. Beyond that depth the field falls back to
  `Mixed` rather than recursing forever - documents nested deeper than the
  cap still round-trip through Mongo, they just lose structural validation
  past that point.
- **`z.catch()`**: Mongoose's `default` only applies when a path is
  `undefined`, not when a *present* value fails validation - which is
  exactly the `.catch()` contract. This is instead implemented via a
  Mongoose `set` transform that re-parses the assigned value against the
  inner Zod type and substitutes the resolved catch value on failure.
- **`z.record()`/`z.map()` with a union value type** (e.g.
  `z.record(z.string(), z.union([z.string(), z.number()]))`): routing this
  through the same "pick the first inner type" handling used for a
  top-level union field would silently coerce every non-first-type value on
  save (e.g. a numeric `Map` value getting cast to a string) - that's data
  corruption, not just a missing feature. Instead, the value is stored as
  `Schema.Types.Mixed` with a `validate` that re-checks each value against
  the original union schema via `.safeParse()`, so every union member's
  actual type round-trips untouched and a value outside the union is
  rejected rather than silently coerced.

## Danger zone

- ⚠️ Record (Being converted to `Map`)
- ⚠️ Plain unions (`z.union()`, as opposed to `z.discriminatedUnion()` above)
  used as a **top-level field type** are not supported by Mongoose and
  **will pick the first inner type**. A union used as a `z.record()`/
  `z.map()` **value type** does not have this limitation - see "Design
  notes" above.

## Not supported by Mongoose

Intersections where either side isn't a plain object schema (e.g.
`z.string().and(z.number())`) have no sane flat-merge interpretation onto a
Mongoose field and will throw a clear error rather than guess.

## Not supported by Zod

- ❌ Indexes

## Not supported yet

- ⏳ Regex validation
- ⏳ instanceOf
