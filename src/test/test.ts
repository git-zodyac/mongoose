import { zId, zodSchema } from '../index.js';
import { z } from 'zod';

const subdoc = z.object({
  title: z.string().min(3).max(255),
  content: z.string().min(3).max(255),
  createdAt: z.date(),
});

const schema = z.object({
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
  tags: z.array(z.string().refine((v) => v.length > 0)),
  createdAt: z.date(),
  updatedAt: z.date(),

  posts: z.array(subdoc),
});

const toSchema = zodSchema(schema);
console.log(toSchema.obj);
