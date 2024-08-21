# Zod to mongoose schema converter

![NPM Version](https://img.shields.io/npm/v/%40zodyac%2Fzod-mongoose)
![NPM Downloads](https://img.shields.io/npm/dw/%40zodyac%2Fzod-mongoose)
![npm bundle size](https://img.shields.io/bundlephobia/min/%40zodyac%2Fzod-mongoose)
![Test coverage](./badges/coverage.svg)

> A part of [Zodyac toolbox](https://npmjs.com/org/zodyac).

This package provides a function to convert [zod](https://www.npmjs.com/package/zod) object to [mongoose](https://www.npmjs.com/package/mongoose) schema.

## Installation

```bash
npm i @zodyac/zod-mongoose

pnpm add @zodyac/zod-mongoose

yarn add @zodyac/zod-mongoose

bun add @zodyac/zod-mongoose
```

## Usage

First, create your zod schema:

```typescript
import { z } from 'zod';
import { zId, zUUID } from '@zodyac/zod-mongoose';

const zUser = z.object({
  name: z.string().min(3).max(255),
  age: z.number().min(18).max(100),
  active: z.boolean().default(false),
  access: z.enum(['admin', 'user']).default('user'),
  companyId: zId.describe('ObjectId:Company'),
  wearable: zUUID.describe('UUID:Wearable'),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.enum(['CA', 'NY', 'TX']),
  }),
  tags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});
```

Then, convert it to mongoose schema and connect model:

```typescript
import { zodSchema } from '@zodyac/zod-mongoose';
import { model } from 'mongoose';

const schema = zodSchema(zDoc);
const userModel = model('User', schema);
```

That's it! Now you can use your mongoose model as usual:

```typescript
userModel.find({ name: 'John' });
```

## Features

- ✅ Basic types
- ✅ Nested objects and schemas
- ✅ Arrays
- ✅ Enums (strings only)
- ✅ Default values
- ✅ Dates
- ✅ ObjectId
- ✅ ObjectId references
- ✅ ZodAny as SchemaTypes.Mixed
- 🔧 UUID (experimental)
- 🔧 UUID references (experimental)
- ❗️ Unions (not supported by mongoose)
- ❗️ Intersection (not supported by mongoose)
- ❗️ Indexes (not supported by zod)
- ⏳ Number enums (coming soon)
- ⏳ Regex validation (coming soon)
- ⏳ Custom validators (coming soon)
- ⏳ instanceOf (coming soon)
- ⏳ Transform (coming soon)
- ⏳ Refine (coming soon)

## Checking schemas

To make sure nothing is missing, you can use `Schema.obj`:

```typescript
// schema is mongoose schema
console.log(schema.obj);
```

## Raw object

If you want to get raw object from zod schema to modify it, you can use `zodSchemaRaw` function:

```typescript
import { zodSchemaRaw } from '@zodyac/zod-mongoose';
import { model, Schema } from 'mongoose';

const schema = zodSchemaRaw(zDoc);
schema.age.validate = (v: number) => v > 18;

const model = model('User', new Schema(schema));
```

## License

MIT
