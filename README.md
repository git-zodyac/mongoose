# Zod to Mongoose schema converter

![NPM Version](https://img.shields.io/npm/v/%40zodyac%2Fzod-mongoose)
![NPM Downloads](https://img.shields.io/npm/dw/%40zodyac%2Fzod-mongoose)
![npm bundle size](https://img.shields.io/bundlephobia/min/%40zodyac%2Fzod-mongoose)
![Test coverage](./badges/coverage.svg)

This package provides a function to convert
[zod](https://www.npmjs.com/package/zod) object to
[mongoose](https://www.npmjs.com/package/mongoose) schema.

> [!NOTE] This package is in early development stage. Please report any issues
> you find and please expect API to change in minor versions.

## Installation

```bash
npm i @zodyac/zod-mongoose

pnpm add @zodyac/zod-mongoose

yarn add @zodyac/zod-mongoose

bun add @zodyac/zod-mongoose
```

## Breaking changes

> [!WARNING]
> If you were using `zId`, `zUUID`, `z.objectId()`, `z.mongoUUID()` before,
> please replace those with `zId()` and `zUUID()`.

- `zId` is now `zId(ref?)`
- `zUUID` is now `zUUID()`

## Usage

First, extend Zod with `extendZod`, then create your zod schema:

```typescript
import { z } from "zod";
import { extendZod } from "@zodyac/zod-mongoose";

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

Then, convert it to mongoose schema and connect model:

```typescript
import { zodSchema } from "@zodyac/zod-mongoose";
import { model } from "mongoose";

const schema = zodSchema(zDoc);
const userModel = model("User", schema);
```

That's it! Now you can use your mongoose model as usual:

```typescript
userModel.find({ name: "John" });
```

> [Note] `extendZod` should be called once for the whole application.

## Features

Full support list can be found in [SUPPORTED.md](./SUPPORTED.md):

- ✅ Basic types
- ✅ Nested objects and schemas
- ✅ Arrays
- ✅ Enums (strings only)
- ✅ Default values
- ✅ Maps
- ✅ Dates
- ✅ ObjectId
- ✅ ObjectId references
- ✅ ZodAny as SchemaTypes.Mixed
- ✅ Validation using refinement for String, Number, Date
- ✅ Unique for String, Number, Date, ObjectId and UUID
- ✅ Sparse for String, Number, Date, ObjectId and UUID

- ⚠️ Record (Being converted to Map)
- ⚠️ Unions (Not supported by mongoose, will pick first inner type)

- ❗️ Intersection (not supported by mongoose)
- ❗️ Set (not supported by mongoose)
- ❗️ Indexes (not supported by zod)

- ⏳ Regex validation (coming soon)
- ⏳ instanceOf (coming soon)

## Checking schemas

To make sure nothing is missing, you can use `Schema.obj`:

```typescript
// schema is mongoose schema
console.log(schema.obj);
```

## Raw object

If you want to get raw object from zod schema to modify it, you can use
`zodSchemaRaw` function:

```typescript
import { extendZod, zodSchemaRaw } from "@zodyac/zod-mongoose";
import { model, Schema } from "mongoose";

extendZod(z);

const schema = zodSchemaRaw(zDoc);
schema.age.index = true;

const model = model(
  "User",
  new Schema(schema, {
    timestamps: true,
  }),
);
```

## ObjectID and UUID

You can use `zId(ref?: string)` and `zUUID(ref?: string)` to describe fields as ObjectID and
UUID and add reference to another collection:

```typescript
import { extendZod } from "@zodyac/zod-mongoose";
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

You can use zod refinement to validate your mongoose models:

```typescript
import { z } from "zod";
import { extendZod, zodSchema } from "@zodyac/zod-mongoose";

extendZod(z);

const zUser = z.object({
  phone: z.string().refine(
    (v) => v.match(/^\d{3}-\d{3}-\d{4}$/),
    "Invalid phone number",
  ),
});
```

## Unique fields

To make a String, Number or Date unique, call `.unique()`:

```typescript
import { z } from "zod";
import { extendZod, zodSchema } from "@zodyac/zod-mongoose";

extendZod(z);

const zUser = z.object({
  phone: z.string().unique(),
});

//
```

## sparse fields

To make a String, Number or Date sparse, call `.sparse()`:

```typescript
import { z } from "zod";
import { extendZod, zodSchema } from "@zodyac/zod-mongoose";

extendZod(z);

const zUser = z.object({
  email: z.string().sparse(),
  // with unique
  // email: z.string()..unique().sparse(),
});

//
```
## Warnings

### ZodUnion types

Union types are not supported by mongoose. If you have a union type in your zod
schema, it will be converted to it's inner type by default.

```typescript
const zUser = z.object({
  access: z.union([z.string(), z.number()]),
});

// Will become
// {
//   access: {
//     type: String,
//   },
// }
```

### ZodAny

`ZodAny` is converted to `SchemaTypes.Mixed`. It's not recommended to use it,
but it's there if you need it.

### ZodRecord

`ZodRecord` is converted to `Map` type. It's not recommended to use it, but it's
there if you need it.

## Contributing

Feel free to open issues and pull requests! Here's a quick guide to get you
started:

- Fork the repository
- Install linter and formatter for VSCode: Biome
- Install dependencies: `npm i`
- Make changes
- Run tests: `npm test`
- Run linter: `npm run lint` (fix with `npm run lint:fix`)
- Commit and push your changes
- Open a pull request

## License

MIT
