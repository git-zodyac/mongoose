# Zod to mongoose schema converter

[![npm version](https://badge.fury.io/js/%40zodyac%2Fmongoose.svg)](https://badge.fury.io/js/%40zodyac%2Fmongoose)

> A part of [Zodyac](https://npmjs.com/org/zodyac) project, but you are absolutely welcome use it separately 😘.

This package provides a function to convert [zod](https://www.npmjs.com/package/zod) object to [mongoose](https://www.npmjs.com/package/mongoose) schema.

## Installation

```bash
npm i @zodyac/mongoose
```

## Usage

First, create your zod schema:

```typescript
import { z } from 'zod';
import { zId } from '@zodyac/mongoose';

const zUser = z.object({
  name: z.string().min(3).max(255),
  age: z.number().min(18).max(100),
  active: z.boolean().default(false),
  access: z.enum(['admin', 'user']).default('user'),
  companyId: zId.describe('ObjectId:Company'),
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
import { zodSchema } from '@zodyac/mongoose';
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
- ❗️ Unions (not supported by mongoose)
- ❗️ Intersection (not supported by mongoose)
- ❗️ Indexes (not supported by zod)
- ⏳ Number enums (comming soon)
- ⏳ Regex validation (comming soon)
- ⏳ Custom validators (comming soon)
- ⏳ instanceOf (comming soon)
- ⏳ Transform (comming soon)
- ⏳ Refine (comming soon)

## Checking schemas

To make sure nothing is missing, you can use ```Schema.obj```:

```typescript
// schema is mongoose schema
console.log(schema.obj);
```

## Raw object

If you want to get raw object from zod schema to modify it, you can use ```zodSchemaRaw``` function:

```typescript
import { zodSchemaRaw } from '@zodyac/mongoose';
import { model, Schema } from 'mongoose';

const schema = zodSchemaRaw(zDoc);
schema.age.validate = (v: number) => v > 18;

const model = model('User', new Schema(schema));
```

## License
MIT
