import { Schema, SchemaTypes, Types } from "mongoose";
import { z } from "zod";
import zodSchema, { extendZod, zId, zodSchemaRaw, zUUID } from "./index";

extendZod(z);

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
  unique_num: z.number().unique().sparse(),
  wearable: zUUID().unique().sparse(),
  wearableWithRef: zUUID("Devices").unique(),
  wearableWithPath: zUUID().unique().refPath("device"),
  devices: zUUID().array(),
  companyId: zId("Company"),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.enum(["CA", "NY", "TX"]),
  }),
  tags: z.string().min(3).max(255).array(),
  filters: z.array(z.string()).default(["default_filter"]),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  last_known_device: zUUID().optional(),
  phone: z
    .string()
    .unique()
    .refine((v) => v.length === 10, "Must be a valid phone number"),
  email: z.string().unique().sparse(),
  curator: zId().optional(),
  unique_id: zId().unique().sparse(),
  unique_date: z.date().unique().sparse(),
  nullable_field: z.string().nullable(),
  hashes: z
    .string()
    .refine((val) => val.startsWith("oi"), { message: "Custom message" })
    .array(),

  posts: z.array(SUBDOCUMENT_SCHEMA),
  keys: z.map(z.string(), z.object({ value: z.number() })),
  number_map: z.map(z.number(), z.object({ value: z.number() })),
  access_map: z.map(z.enum(["admin", "user"]), z.object({ value: z.number() })),
  sessions: z.record(z.date(), z.string()),
  notes: z.any(),
  devices_last_seen: z.record(zUUID(), z.date()),
  last_contacted: z.record(zId(), z.date()),
});

const schema = zodSchema(EXAMPLE_SCHEMA);
// console.log(schema.obj);

describe("Overall", () => {
  test("Smoke test", () => {
    expect(schema).toBeDefined();
  });

  test("zodSchema should return a mongoose schema", () => {
    expect(schema).toBeInstanceOf(Schema);
  });

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

  test("zodSchema should support mongoose field options", () => {
    const schema = zodSchemaRaw(EXAMPLE_SCHEMA);
    schema.phone.index = true;

    expect(schema.phone.index).toBe(true);
  });
});

describe("ID Helpers", () => {
  // General
  test("zId() should represent valid ObjectID", () => {
    const id = new Types.ObjectId();
    const parsed = zId().safeParse(id);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toBe(id);
  });

  test("zId() should represent a string in ObjectID format", () => {
    const id = new Types.ObjectId().toString();
    const parsed = zId().safeParse(id);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toBe(id);
  });

  test("zUUID() should represent a valid UUID", () => {
    const id = new Types.UUID();
    const parsed = zUUID().safeParse(id);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toBe(id);
  });

  test("zId() should not represent an invalid ObjectID", () => {
    const id = "invalid";
    const parsed = zId().safeParse(id);
    expect(parsed.success).toBe(false);
  });

  test("zUUID() should not represent an invalid UUID", () => {
    const id = "invalid";
    const parsed = zUUID().safeParse(id);
    expect(parsed.success).toBe(false);
  });

  test("zId() should not represent an invalid UUID", () => {
    const id = new Types.UUID();
    const parsed = zId().safeParse(id);
    expect(parsed.success).toBe(false);
  });

  test("zUUID() should not represent an invalid ObjectID", () => {
    const id = new Types.ObjectId();
    const parsed = zUUID().safeParse(id);
    expect(parsed.success).toBe(false);
  });

  test("zId() should support being optional", () => {
    const schema = zodSchema(
      z.object({
        id: zId().optional(),
      }),
    );

    expect((<any>schema.obj.id).type).toBe(SchemaTypes.ObjectId);
    expect((<any>schema.obj.id).required).toBe(false);
  });

  test("zId(ref) should define reference when created", () => {
    const schema = zodSchema(
      z.object({
        id: zId("Company"),
      }),
    );

    expect((<any>schema.obj.id).ref).toBe("Company");
  });

  test("zId(ref) should support being optional", () => {
    const schema = zodSchema(
      z.object({
        id: zId("Company").optional(),
      }),
    );

    expect((<any>schema.obj.id).type).toBe(SchemaTypes.ObjectId);
    expect((<any>schema.obj.id).required).toBe(false);
    expect((<any>schema.obj.id).ref).toBe("Company");
  });

  test("zId().ref(ref) should define reference", () => {
    const schema = zodSchema(
      z.object({
        id: zId().ref("Company"),
      }),
    );

    expect((<any>schema.obj.id).ref).toBe("Company");
  });

  test("zId().ref(ref) should support being optional", () => {
    const schema = zodSchema(
      z.object({
        id: zId().ref("Company").optional(),
      }),
    );

    expect((<any>schema.obj.id).type).toBe(SchemaTypes.ObjectId);
    expect((<any>schema.obj.id).required).toBe(false);
    expect((<any>schema.obj.id).ref).toBe("Company");
  });

  test("zId().refPath(ref) should define reference path", () => {
    const schema = zodSchema(
      z.object({
        id: zId().refPath("company"),
      }),
    );

    expect((<any>schema.obj.id).refPath).toBe("company");
  });

  test("zId().refPath(ref) should support being optional", () => {
    const schema = zodSchema(
      z.object({
        id: zId().refPath("company").optional(),
      }),
    );

    expect((<any>schema.obj.id).type).toBe(SchemaTypes.ObjectId);
    expect((<any>schema.obj.id).required).toBe(false);
    expect((<any>schema.obj.id).refPath).toBe("company");
  });

  test("zUUID() should support being optional", () => {
    const schema = zodSchema(
      z.object({
        id: zUUID().optional(),
      }),
    );

    expect((<any>schema.obj.id).type).toBe(SchemaTypes.UUID);
    expect((<any>schema.obj.id).required).toBe(false);
  });

  test("zUUID(ref) should define reference when created", () => {
    const schema = zodSchema(
      z.object({
        id: zUUID("Device"),
      }),
    );

    expect((<any>schema.obj.id).ref).toBe("Device");
  });

  test("zUUID(ref) should support being optional", () => {
    const schema = zodSchema(
      z.object({
        id: zUUID().ref("Device").optional(),
      }),
    );

    expect((<any>schema.obj.id).type).toBe(SchemaTypes.UUID);
    expect((<any>schema.obj.id).required).toBe(false);
  });

  test("zUUID().ref(ref) should define reference", () => {
    const schema = zodSchema(
      z.object({
        id: zUUID().ref("Device"),
      }),
    );

    expect((<any>schema.obj.id).type).toBe(SchemaTypes.UUID);
    expect((<any>schema.obj.id).ref).toBe("Device");
  });

  test("zUUID().ref(ref) should support being optional", () => {
    const schema = zodSchema(
      z.object({
        id: zUUID().ref("Device").optional(),
      }),
    );

    expect((<any>schema.obj.id).type).toBe(SchemaTypes.UUID);
    expect((<any>schema.obj.id).required).toBe(false);
    expect((<any>schema.obj.id).ref).toBe("Device");
  });

  test("zUUID().refPath(ref) should define reference path", () => {
    const schema = zodSchema(
      z.object({
        id: zUUID().refPath("device"),
      }),
    );

    expect((<any>schema.obj.id).type).toBe(SchemaTypes.UUID);
    expect((<any>schema.obj.id).refPath).toBe("device");
  });

  test("zUUID().refPath(ref) should support being optional", () => {
    const schema = zodSchema(
      z.object({
        id: zUUID().refPath("device").optional(),
      }),
    );

    expect((<any>schema.obj.id).type).toBe(SchemaTypes.UUID);
    expect((<any>schema.obj.id).required).toBe(false);
    expect((<any>schema.obj.id).refPath).toBe("device");
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

  test("Unsupported type should throw an error", () => {
    const schema = z.object({
      field: z.unknown(),
    });

    expect(() => zodSchema(schema)).toThrow();
  });

  test("Unsupported Map key should not throw an error", () => {
    const schema = z.object({
      field: z.map(z.unknown(), z.string()),
    });

    expect(() => zodSchema(schema)).not.toThrow();
    const { obj } = zodSchema(schema);

    expect((<any>obj.field).type).toBe(Map);
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
    expect((<any>schema.obj.number_map).type).toBe(Map);
    expect((<any>schema.obj.access_map).type).toBe(Map);

    expect((<any>schema.obj.keys).of.value.type).toBe(Number);
    expect((<any>schema.obj.number_map).of.value.type).toBe(Number);
    expect((<any>schema.obj.access_map).of.value.type).toBe(Number);

    expect((<any>schema.obj.sessions).of.type).toBe(String);
  });

  test("Record should have correct type", () => {
    if (!schema.obj.sessions) throw new Error("No sessions definition");

    expect((<any>schema.obj.sessions).type).toBe(Map);
    expect((<any>schema.obj.sessions).of.type).toBe(String);
  });

  test("Complex Record should have correct type", () => {
    if (!schema.obj.sessions) throw new Error("No sessions definition");

    expect((<any>schema.obj.devices_last_seen).type).toBe(Map);
    expect((<any>schema.obj.devices_last_seen).of.type).toBe(Date);

    expect((<any>schema.obj.last_contacted).type).toBe(Map);
    expect((<any>schema.obj.last_contacted).of.type).toBe(Date);
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

  test("ZodAny field should have correct type - Mixed", () => {
    if (!schema.obj.notes) throw new Error("No notes definition");

    expect((<any>schema.obj.notes).type).toBe(SchemaTypes.Mixed);
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

  test("Nested refinements should work as expected", () => {
    expect((<any>schema.obj.hashes).type[0].validate).toBeDefined();
    expect((<any>schema.obj.hashes).type[0].validate.validator).toBeInstanceOf(Function);
    expect((<any>schema.obj.hashes).type[0].validate.message).toBeDefined();
  });

  test("Strings refinements should be defined", () => {
    expect((<any>schema.obj.phone).validate).toBeDefined();
    expect((<any>schema.obj.phone).validate.validator).toBeInstanceOf(Function);
    expect((<any>schema.obj.phone).validate.message).toBeDefined();
  });

  test("Unique string schema", () => {
    expect((<any>schema.obj.phone).unique).toBe(true);
    expect((<any>schema.obj.name).unique).toBe(false);
  });

  test("Unique number schema", () => {
    expect((<any>schema.obj.unique_num).unique).toBe(true);
    expect((<any>schema.obj.age).unique).toBe(false);
  });

  test("Unique date schema", () => {
    expect((<any>schema.obj.unique_date).unique).toBe(true);
    expect((<any>schema.obj.createdAt).unique).toBeFalsy();
    expect((<any>schema.obj.updatedAt).unique).toBeFalsy();
  });

  test("Unique objectId schema", () => {
    expect((<any>schema.obj.unique_id).unique).toBe(true);
    expect((<any>schema.obj.companyId).unique).toBeFalsy();
  });

  test("Unique mongoUUID schema", () => {
    expect((<any>schema.obj.wearable).unique).toBe(true);
  });

  test("Sparse string schema", () => {
    expect((<any>schema.obj.email).sparse).toBe(true);
    expect((<any>schema.obj.name).sparse).toBe(false);
  });

  test("Sparse number schema", () => {
    expect((<any>schema.obj.unique_num).sparse).toBe(true);
    expect((<any>schema.obj.age).sparse).toBe(false);
  });

  test("Sparse date schema", () => {
    expect((<any>schema.obj.unique_date).sparse).toBe(true);
    expect((<any>schema.obj.createdAt).sparse).toBeFalsy();
    expect((<any>schema.obj.updatedAt).sparse).toBeFalsy();
  });

  test("Sparse objectId schema", () => {
    expect((<any>schema.obj.unique_id).sparse).toBe(true);
    expect((<any>schema.obj.companyId).sparse).toBeFalsy();
  });

  test("Sparse mongoUUID schema", () => {
    expect((<any>schema.obj.wearable).sparse).toBe(true);
  });

  

  test("Nullable field should be nullable", () => {
    expect((<any>schema.obj.nullable_field).required).toBe(false);
    expect((<any>schema.obj.nullable_field).default).toBe(null);
  });
});
