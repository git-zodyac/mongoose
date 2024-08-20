import { SchemaTypes, Types } from "mongoose";
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
  tags: z.string().min(3).max(255).array(),
  filters: z.array(z.string()).default(["default_filter"]),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  last_known_device: zUUID.optional(),
  curator: zId.optional(),

  posts: z.array(SUBDOCUMENT_SCHEMA),
  keys: z.map(z.string(), z.object({ value: z.number() })),
});

const schema = zodSchema(EXAMPLE_SCHEMA);
console.log(schema.obj);
// console.log(JSON.stringify(schema.obj, null, 2));

describe("Overall", () => {
  test("zodSchema should contain all fields", () => {
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
});

describe("Helpers", () => {
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

  test("zUUID should represent a valid UUID", () => {
    const id = new Types.UUID();
    const parsed = zUUID.safeParse(id);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toBe(id);
  });

  test("zId should not represent an invalid ObjectID", () => {
    const id = "invalid";
    const parsed = zId.safeParse(id);
    expect(parsed.success).toBe(false);
  });

  test("zUUID should not represent an invalid UUID", () => {
    const id = "invalid";
    const parsed = zUUID.safeParse(id);
    expect(parsed.success).toBe(false);
  });

  test("zId should not represent an invalid UUID", () => {
    const id = new Types.UUID();
    const parsed = zId.safeParse(id);
    expect(parsed.success).toBe(false);
  });

  test("zUUID should not represent an invalid ObjectID", () => {
    const id = new Types.ObjectId();
    const parsed = zUUID.safeParse(id);
    expect(parsed.success).toBe(false);
  });

  test("zId should support being optional", () => {
    const obj = zodSchema(z.object({ id: zId.optional() }));
    expect((<any>obj.obj.id).type).toBe(SchemaTypes.ObjectId);
    expect((<any>obj.obj.id).required).toBe(false);
  });

  test("zUUID should support being optional", () => {
    const obj = zodSchema(z.object({ id: zUUID.optional() }));
    expect((<any>obj.obj.id).type).toBe(SchemaTypes.UUID);
    expect((<any>obj.obj.id).required).toBe(false);
  });
});

describe("Unsupported types", () => {
  test("Union should pickup first type from union only", () => {
    const schema = z.object({
      field: z.union([z.string(), z.number()]),
    });

    const { obj } = zodSchema(schema);
    if (!obj.field) throw new Error("No field definition");

    expect((<any>obj.field).type).toBe(String);
  });
});

describe("Supported types", () => {
  test("String should have correct type", () => {
    if (!schema.obj.name) throw new Error("No name definition");

    expect((<any>schema.obj.name).type).toBe(String);
  });

  test("Number should have correct type", () => {
    if (!schema.obj.age) throw new Error("No age definition");

    expect((<any>schema.obj.age).type).toBe(Number);
  });

  test("Boolean should have correct type", () => {
    if (!schema.obj.active) throw new Error("No active definition");

    expect((<any>schema.obj.active).type).toBe(Boolean);
  });

  test("Date should have correct type", () => {
    if (!schema.obj.createdAt) throw new Error("No createdAt definition");

    expect((<any>schema.obj.createdAt).type).toBe(Date);
  });

  test("ObjectId should have correct type", () => {
    if (!schema.obj.companyId) throw new Error("No companyId definition");

    expect((<any>schema.obj.companyId).type).toBe(SchemaTypes.ObjectId);
  });

  test("UUID should have correct type", () => {
    if (!schema.obj.wearable) throw new Error("No wearable definition");

    expect((<any>schema.obj.wearable).type).toBe(SchemaTypes.UUID);
  });

  test("Array should have correct type", () => {
    if (!schema.obj.tags) throw new Error("No tags definition");

    expect(Array.isArray((<any>schema.obj.tags).type)).toBe(true);
    expect((<any>schema.obj.tags).type[0].type).toBe(String);
  });

  test("Enum should have correct type", () => {
    if (!schema.obj.access) throw new Error("No access definition");

    expect((<any>schema.obj.access).type).toBe(String);
    expect((<any>schema.obj.access).enum).toEqual(["admin", "user"]);
  });

  test("Object should have correct type", () => {
    if (!schema.obj.address) throw new Error("No address definition");

    for (const key of Object.keys(schema.obj.address)) {
      expect((<any>schema.obj.address)[key].type).toBe(String);
    }

    expect((<any>schema.obj.address).street.type).toBe(String);
    expect((<any>schema.obj.address).city.type).toBe(String);
    expect((<any>schema.obj.address).state.type).toBe(String);
  });

  test("Map should have correct type", () => {
    if (!schema.obj.keys) throw new Error("No keys definition");

    expect((<any>schema.obj.keys).type).toBe(Map);
    expect((<any>schema.obj.keys).of).toBe(String);
  });

  test("Array of objects should have correct type", () => {
    if (!schema.obj.posts) throw new Error("No posts definition");

    expect(Array.isArray((<any>schema.obj.posts).type)).toBe(true);
    for (const key of Object.keys(SUBDOCUMENT_SCHEMA.shape)) {
      expect(key in (<any>schema.obj.posts).type[0]).toBe(true);
    }
  });

  test("Array should have correct default value", () => {
    if (!schema.obj.filters) throw new Error("No roles definition");

    expect((<any>schema.obj.filters).default).toEqual(["default_filter"]);
  });

  test("Boolean field should have correct default value", () => {
    if (!schema.obj.active) throw new Error("No active definition");

    expect((<any>schema.obj.active).default).toBe(false);
  });

  test("Enum field should have correct default value", () => {
    if (!schema.obj.access) throw new Error("No access definition");

    expect((<any>schema.obj.access).default).toBe("user");
  });
});

describe("Validation", () => {
  test("String should have correct validation", () => {
    if (!schema.obj.name) throw new Error("No name definition");

    expect((<any>schema.obj.name).minLength).toBe(3);
    expect((<any>schema.obj.name).maxLength).toBe(255);
  });

  test("Number should have correct validation", () => {
    if (!schema.obj.age) throw new Error("No age definition");

    expect((<any>schema.obj.age).min).toBe(18);
    expect((<any>schema.obj.age).max).toBe(100);
  });

  test("String array should have correct validation", () => {
    if (!schema.obj.tags) throw new Error("No tags definition");

    expect((<any>schema.obj.tags).type[0].minLength).toBe(3);
    expect((<any>schema.obj.tags).type[0].maxLength).toBe(255);
  });

  test("Optional fields should have correct validation", () => {
    if (!schema.obj.updatedAt) throw new Error("No updatedAt definition");

    expect((<any>schema.obj.updatedAt).required).toBe(false);
    expect((<any>schema.obj.last_known_device).required).toBe(false);
    expect((<any>schema.obj.curator).required).toBe(false);
  });
});
