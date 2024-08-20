import { Types } from "mongoose";
import { z } from "zod";
import zodSchema, { zId, zodSchemaRaw, zUUID } from "./index";

const SUBDOCUMENT_SCHEMA = z.object({
  title: z.string().min(3).max(255),
  content: z.string().min(3).max(255),
  createdAt: z.date(),
});

const EXAMPLE_SCHEMA = z.object({
  name: z.string().min(3).max(255),
  age: z.number().min(18).max(100),
  active: z.boolean().default(false),
  access: z.enum(["admin", "user"]).default("user"),
  wearable: zUUID.describe("UUID:Wearable"),
  companyId: zId.describe("ObjectId:Company"),
  address: z.object({
    street: z.string().describe("unique"),
    city: z.string(),
    state: z.enum(["CA", "NY", "TX"]),
  }),
  tags: z.array(z.string().refine((v) => v.length > 0)).default(["amazing"]),
  createdAt: z.date(),
  updatedAt: z.date(),

  posts: z.array(SUBDOCUMENT_SCHEMA),
});
describe("Overall", () => {
  test("zodSchema should contain all fields", () => {
    const schema = zodSchema(EXAMPLE_SCHEMA);
    for (const key of Object.keys(EXAMPLE_SCHEMA.shape)) {
      expect(key in schema.obj).toBe(true);
    }
  });

  test("zodSchemaRaw should contain all fields", () => {
    const obj = zodSchemaRaw(EXAMPLE_SCHEMA);
    for (const key of Object.keys(EXAMPLE_SCHEMA.shape)) {
      expect(key in obj).toBe(true);
    }
  });

  test("zId should represent valid ObjectID", () => {
    const id = new Types.ObjectId();
    const parsed = zId.safeParse(id);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toBe(id);
  });

  test("zId should represent a string in ObjectID format", () => {
    const id = new Types.ObjectId().toString();
    const parsed = zId.safeParse(id);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toBe(id);
  });

  test("The default value for array should assign", () => {
    const schema = zodSchema(EXAMPLE_SCHEMA);

    expect((schema.obj.tags as any)[0].default).toBe(
      EXAMPLE_SCHEMA.shape.tags._def.defaultValue()
    );
  });
});
