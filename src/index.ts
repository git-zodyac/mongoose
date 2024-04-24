import { zm } from "./mongoose.types.js";
import { Schema, SchemaTypes, Types, isValidObjectId } from "mongoose";
import {
  ZodAny,
  ZodArray,
  ZodBoolean,
  ZodDate,
  ZodDefault,
  ZodEffects,
  ZodEnum,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodRawShape,
  ZodString,
  ZodType,
  ZodUnion,
  z,
} from "zod";

/**
 * Converts a Zod schema to a Mongoose schema
 * @param schema zod schema to parse
 * @returns mongoose schema
 *
 * @example
 * import { zId, zodSchema } from '@zodyac/zod-mongoose';
 * import { model } from 'mongoose';
 * import { z } from 'zod';
 *
 * const zUser = z.object({
 *   name: z.string().min(3).max(255),
 *   age: z.number().min(18).max(100),
 *   active: z.boolean().default(false),
 *   access: z.enum(['admin', 'user']).default('user'),
 *   companyId: zId.describe('ObjectId:Company'),
 *   address: z.object({
 *     street: z.string(),
 *     city: z.string(),
 *     state: z.enum(['CA', 'NY', 'TX']),
 *   }),
 *   tags: z.array(z.string()),
 *   createdAt: z.date(),
 *   updatedAt: z.date(),
 * });
 *
 * const schema = zodSchema(zDoc);
 * const userModel = model('User', schema);
 */
export function zodSchema<T extends ZodRawShape>(
  schema: ZodObject<T>,
): Schema<z.infer<typeof schema>> {
  const definition = parseObject(schema);
  return new Schema<z.infer<typeof schema>>(definition);
}

/**
 * Converts a Zod schema to a raw Mongoose schema object
 * @param schema zod schema to parse
 * @returns mongoose schema
 *
 * @example
 * import { zId, zodSchemaRaw } from '@zodyac/zod-mongoose';
 * import { model, Schema } from 'mongoose';
 * import { z } from 'zod';
 *
 * const zUser = z.object({
 *   name: z.string().min(3).max(255),
 *   age: z.number().min(18).max(100),
 *   active: z.boolean().default(false),
 *   access: z.enum(['admin', 'user']).default('user'),
 *   companyId: zId.describe('ObjectId:Company'),
 *   address: z.object({
 *    street: z.string(),
 *    city: z.string(),
 *    state: z.enum(['CA', 'NY', 'TX']),
 *   }),
 *  tags: z.array(z.string()),
 *  createdAt: z.date(),
 *  updatedAt: z.date(),
 * });
 *
 * const rawSchema = zodSchemaRaw(zDoc);
 * const schema = new Schema(rawSchema);
 * const userModel = model('User', schema);
 */
export function zodSchemaRaw<T extends ZodRawShape>(
  schema: ZodObject<T>,
): zm._Schema<T> {
  return parseObject(schema);
}

/**
 * Zod ObjectId type
 *
 * You can provide a reference to a model to enable population via zod .describe() method.
 * Description must start with 'ObjectId:' followed by the collection name.
 *
 * Can also be used for string validation for ObjectId.
 *
 * @example
 * import { zId } from '@zodyac/zod-mongoose';
 * import { z } from 'zod';
 *
 * const zUser = z.object({
 *  name: z.string().min(3).max(255),
 *  companyId: zId.describe('ObjectId:Company'),
 * });
 */
export const zId = z
  .string()
  .refine((v) => isValidObjectId(v), { message: "Invalid ObjectId" })
  .or(z.instanceof(Types.ObjectId).describe("ObjectId"));

/**
 * Zod UUID type (experimental)
 *
 * Use with caution.
 *
 * You can provide a reference to a model to enable population via zod .describe() method.
 * Description must start with 'UUID:' followed by the collection name.
 *
 * Can also be used for string validation for UUID.
 *
 * @warning
 * This is an expreimental feature.
 * UUIDs in Mongoose are a bit of a pain.
 * Mongoose uses version 4 UUIDs, which may not be compatible with the UUIDs used in other languages, e.g. C#.
 *
 * @example
 * import { zUUID, zodSchema } from '@zodyac/zod-mongoose';
 * import { z } from 'zod';
 *
 * const zUser = z.object({
 *   name: z.string().min(3).max(255),
 *   wearable: zUUID.describe('UUID:Wearable'),
 * });
 */
export const zUUID = z
  .string()
  .uuid({ message: "Invalid UUID" })
  .or(z.instanceof(Types.UUID).describe("UUID"));

// Helpers
function parseObject<T extends ZodRawShape>(obj: ZodObject<T>): zm._Schema<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const object: any = {};
  for (const [key, field] of Object.entries(obj.shape)) {
    if (field instanceof ZodObject) {
      object[key] = parseObject(field);
    } else {
      const f = parseField(field);
      if (f) object[key] = f;
      else
        console.error(
          `Key ${key}: Unsupported field type: ${field.constructor}`,
        );
    }
  }
  return object;
}

function parseField<T>(
  field: ZodType<T>,
  required?: boolean,
  def?: T,
  // validate?: (v: T) => boolean,
): zm.mField | null {
  if (field instanceof ZodObject) {
    return parseObject(field);
  }

  if (field instanceof ZodNumber) {
    return parseNumber(
      field,
      required,
      def as number,
      // validate as (v: number) => boolean,
    );
  }

  if (field instanceof ZodString) {
    return parseString(
      field,
      required,
      def as string,
      // validate as (v: string) => boolean,
    );
  }

  if (field instanceof ZodEnum) {
    return parseEnum(Object.keys(field.Values), required, def as string);
  }

  if (field instanceof ZodBoolean) {
    return parseBoolean(required, def as boolean);
  }

  if (field instanceof ZodDate) {
    return parseDate(required, def as Date);
  }

  if (field instanceof ZodArray) {
    return [parseField(field.element)];
  }

  if (field instanceof ZodDefault) {
    return parseField(
      field._def.innerType,
      required,
      field._def.defaultValue(),
    );
  }

  if (field instanceof ZodOptional) {
    return parseField(field._def.innerType, false, undefined);
  }

  if (field instanceof ZodNullable) {
    return parseField(field._def.innerType, false, def || null);
  }

  if (field.description?.startsWith("ObjectId")) {
    const ref = field.description.split(":")[1];
    if (ref) return parseObjectIdRef(required, ref);
    return parseObjectId(required);
  }

  if (field.description?.startsWith("UUID")) {
    const ref = field.description.split(":")[1];
    if (ref) return parseUUIDRef(required, ref);
    return parseUUID(required);
  }

  if (field instanceof ZodUnion) {
    return parseField(field._def.options[0]);
  }

  if (field instanceof ZodAny) {
    return parseMixed(required, def);
  }

  if (field instanceof ZodEffects) {
    if (field._def.effect.type === "refinement") {
      return parseField(
        field._def.schema,
        required,
        def,
        // field._def.effect.refinement as (v: T) => boolean,
      );
    }
  }
  return null;
}

function parseNumber(
  field: ZodNumber,
  required: boolean = true,
  def?: number,
  validate?: (v: number) => boolean,
): zm.mNumber {
  if (validate) {
    return {
      type: Number,
      default: def,
      min: field.minValue ?? undefined,
      max: field.maxValue ?? undefined,
      validation: {
        validate,
      },
      required,
    };
  }

  return {
    type: Number,
    default: def,
    min: field.minValue ?? undefined,
    max: field.maxValue ?? undefined,
    required,
  };
}

function parseString(
  field: ZodString,
  required: boolean = true,
  def?: string,
  validate?: ((v: string) => boolean) | undefined,
): zm.mString {
  if (validate) {
    return {
      type: String,
      default: def,
      required,
      minLength: field.minLength ?? undefined,
      maxLength: field.maxLength ?? undefined,
      validation: {
        validate,
      },
    };
  }

  return {
    type: String,
    default: def,
    // TODO: match: field.regex(),
    required,
    minLength: field.minLength ?? undefined,
    maxLength: field.maxLength ?? undefined,
  };
}

function parseEnum(
  values: string[],
  required: boolean = true,
  def?: string,
): zm.mString {
  return {
    type: String,
    default: def,
    enum: values,
    required,
  };
}

function parseBoolean(required: boolean = true, def?: boolean): zm.mBoolean {
  return {
    type: Boolean,
    default: def,
    required,
  };
}

function parseDate(required: boolean = true, def?: Date): zm.mDate {
  return {
    type: Date,
    default: def,
    required,
  };
}

function parseObjectId(required: boolean = true): zm.mObjectId {
  return {
    type: SchemaTypes.ObjectId,
    required,
  };
}

function parseObjectIdRef(required: boolean = true, ref: string): zm.mObjectId {
  return {
    type: SchemaTypes.ObjectId,
    ref,
    required,
  };
}

function parseUUID(required: boolean = true): zm.mUUID {
  return {
    type: SchemaTypes.UUID,
    required,
  };
}

function parseUUIDRef(required: boolean = true, ref: string): zm.mUUID {
  return {
    type: SchemaTypes.UUID,
    ref,
    required,
  };
}

function parseMixed(
  required: boolean = true,
  def?: unknown,
): zm.mMixed<unknown> {
  return {
    type: SchemaTypes.Mixed,
    default: def,
    required,
  };
}

export default zodSchema;
