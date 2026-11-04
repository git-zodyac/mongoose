import { type HydratedDocument, type InferSchemaType, model, Types } from "mongoose";
import { z } from "zod";
import { extendZod, toPartialUpdateSchema, zId, zodSchema, zUUID } from "./index";

// Mirrors the README "Quick start" snippet. If this test stops compiling or
// passing, update the README to match.
extendZod(z);

const zUser = z.object({
  name: z.string().min(3).max(255),
  email: z.string().unique(),
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
});

const schema = zodSchema(zUser);
const User = model("ReadmeUser", schema);

type UserDoc = HydratedDocument<InferSchemaType<typeof schema>>;

describe("README quick start", () => {
  test("builds a model and applies defaults and validation", async () => {
    const doc: UserDoc = new User({
      name: "John",
      email: "john@example.com",
      age: 30,
      companyId: new Types.ObjectId(),
      wearable: "6f1c9d0e-8a7b-4c3d-9e2f-1a2b3c4d5e6f",
      address: { street: "1 Main", city: "NYC", state: "NY" },
      tags: ["a"],
      createdAt: new Date(),
    });
    expect(doc.active).toBe(false);
    expect(doc.access).toBe("user");
    await expect(doc.validate()).resolves.toBeUndefined();

    const bad = new User({ name: "Jo", age: 10 });
    await expect(bad.validate()).rejects.toThrow();
  });

  test("toPartialUpdateSchema strips defaults for PATCH bodies", () => {
    const body = toPartialUpdateSchema(zUser).parse({ name: "Johnny" });
    expect(body).toEqual({ name: "Johnny" });
  });
});
