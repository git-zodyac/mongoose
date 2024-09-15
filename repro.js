import { z } from "zod";
import { extendZod, zodSchemaRaw } from "./dist/index.js";

extendZod(z);

const schema = z.object({
  name: z.string().optional().default('Bob'),
  age: z.number().default(3).optional(),
  isHappy: z.boolean().optional(),
  birthday: z.date().default(new Date())
});

const data = zodSchemaRaw(schema);
console.log(data);
