# List of supported types and features

This is the list of all enabled features and types in `zod-mongoose`. If there
is a feature or type you would like to see supported, please open an issue on
GitHub.

Please note that this list is not exhaustive and may change in the future. It
contains the features that are encountered the most, are uncontroversial and are
being tested.

## Full support

These types and features are fully supported and tested:

- ✅ Number (ZodNumber)
- ✅ String (ZodString)
- ✅ Boolean (ZodBoolean)
- ✅ Date (ZodDate)
- ✅ Null (ZodNull)
- ✅ Mixed (ZodAny)
- ✅ ObjectId (custom, `zId()`)
- ✅ UUID (custom, `zUUID()`)
- ✅ Nested objects and schemas (ZodObject)
- ✅ Arrays (ZodArray)
- ✅ Enums (strings only)
- ✅ Default values (ZodDefault)
- ✅ Maps (ZodRecord)
- ✅ ObjectId references (custom, `zId(ref)`)
- ✅ Optional fields (ZodOptional)
- ✅ Validation using refinement (`z.refine()`):
  - `String`,
  - `Number`,
  - `Date`
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

## Danger zone

- ⚠️ Record (Being converted to `Map`)
- ⚠️ Unions (Not supported by mongoose, **will pick first inner type**)

## Not supported by Mongoose

- ❌ ZodTuple

## Not supported by Zod

- ❌ Indexes

## Not supported yet

- ❌ Discriminated unions (See
  [#16](https://github.com/git-zodyac/mongoose/issues/16))
- ⏳ Regex validation
- ⏳ instanceOf
