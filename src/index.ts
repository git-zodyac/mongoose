import { Schema, type SchemaOptions, SchemaTypes } from "mongoose";
import type { ZodNumber, ZodObject, ZodRawShape, ZodString, ZodType, z } from "zod";

import zmAssert from "./assertions/assertions.js";
import type { zm } from "./mongoose.types.js";

export * from "./extension.js";

/**
 * Converts a Zod schema to a Mongoose schema
 * @param schema zod schema to parse
 * @returns mongoose schema
 *
 * @example
 * import { extendZod, zodSchema } from '@zodyac/zod-mongoose';
 * import { model } from 'mongoose';
 * import { z } from 'zod';
 *
 * extendZod(z);
 *
 * const zUser = z.object({
 *   name: z.string().min(3).max(255),
 *   age: z.number().min(18).max(100),
 *   active: z.boolean().default(false),
 *   access: z.enum(['admin', 'user']).default('user'),
 *   companyId: zId('Company'),
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
  options?: SchemaOptions<any>, // TODO: Fix any
): Schema<z.infer<typeof schema>> {
  const definition = parseObject(schema, true);
  return new Schema<z.infer<typeof schema>>(definition, options);
}

/**
 * Converts a Zod schema to a raw Mongoose schema object
 * @param schema zod schema to parse
 * @returns mongoose schema
 *
 * @example
 * import { extendZod, zodSchemaRaw } from '@zodyac/zod-mongoose';
 * import { model, Schema } from 'mongoose';
 * import { z } from 'zod';
 *
 * extendZod(z);
 *
 * const zUser = z.object({
 *   name: z.string().min(3).max(255),
 *   age: z.number().min(18).max(100),
 *   active: z.boolean().default(false),
 *   access: z.enum(['admin', 'user']).default('user'),
 *   companyId: zId('Company'),
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
export function zodSchemaRaw<T extends ZodRawShape>(schema: ZodObject<T>): zm._Schema<T> {
  return parseObject(schema, true) as zm._Schema<T>;
}

// Helpers
function parseObject<T extends ZodRawShape>(obj: ZodObject<T>, required = true): zm._Schema<T> | zm.mSubdocument<T> {
  const object: any = {};
  for (const [key, field] of Object.entries(obj.shape)) {
    if (zmAssert.object(field)) {
      object[key] = parseObject(field, true);
    } else {
      const f = parseField(field);
      if (!f) throw new Error(`Unsupported field type: ${field.constructor}`);

      object[key] = f;
    }
  }

  if (!required) {
    return {
      type: object,
      required: false,
    } as zm.mSubdocument<T>;
  }

  return object;
}

function parseField<T>(
  field: ZodType<T>,
  required = true,
  def?: zm.mDefault<T>,
  refinement?: zm.EffectValidator<T>,
): zm.mField | null {
  if (zmAssert.objectId(field)) {
    const ref = (<any>field).__zm_ref;
    const refPath = (<any>field).__zm_refPath;
    const unique = (<any>field).__zm_unique;
    const sparse = (<any>field).__zm_sparse;
    return parseObjectId(required, ref, unique, refPath, sparse);
  }

  if (zmAssert.uuid(field)) {
    const ref = (<any>field).__zm_ref;
    const refPath = (<any>field).__zm_refPath;
    const unique = (<any>field).__zm_unique;
    const sparse = (<any>field).__zm_unique;
    return parseUUID(required, ref, unique, refPath, sparse);
  }

  if (zmAssert.object(field)) {
    return parseObject(field, required);
  }

  if (zmAssert.number(field)) {
    const isUnique = field.__zm_unique ?? false;
    const isSparse = field.__zm_sparse ?? false;
    return parseNumber(
      field,
      required,
      def as zm.mDefault<number>,
      isUnique,
      refinement as zm.EffectValidator<number>,
      isSparse,
    );
  }

  if (zmAssert.string(field)) {
    const isUnique = field.__zm_unique ?? false;
    const isSparse = field.__zm_sparse ?? false;
    return parseString(
      field,
      required,
      def as zm.mDefault<string>,
      isUnique,
      refinement as zm.EffectValidator<string>,
      isSparse,
    );
  }

  if (zmAssert.enumerable(field)) {
    return parseEnum(Object.keys(field.Values), required, def as zm.mDefault<string>);
  }

  if (zmAssert.nativeEnumerable(field)) {
    return parseEnum(
      Object.values(field._def.values),
      required,
      def as zm.mDefault<string>,
    );
  }

  if (zmAssert.boolean(field)) {
    return parseBoolean(required, def as zm.mDefault<boolean>);
  }

  if (zmAssert.date(field)) {
    const isUnique = field.__zm_unique ?? false;
    const isSparse = field.__zm_sparse ?? false;
    return parseDate(
      required,
      def as zm.mDefault<Date>,
      refinement as zm.EffectValidator<Date>,
      isUnique,
      isSparse,
    );
  }

  if (zmAssert.array(field)) {
    return parseArray(
      required,
      field.element,
      def as zm.mDefault<T extends Array<infer K> ? K[] : never>,
    );
  }

  if (zmAssert.def(field)) {
    return parseField(field._def.innerType, required, field._def.defaultValue);
  }

  if (zmAssert.optional(field)) {
    return parseField(field._def.innerType, false, undefined);
  }

  if (zmAssert.nullable(field)) {
    return parseField(
      field._def.innerType,
      false,
      (typeof def !== "undefined" ? def : () => null) as zm.mDefault<null>,
    );
  }

  if (zmAssert.union(field)) {
    return parseField(field._def.options[0]);
  }

  if (zmAssert.any(field)) {
    return parseMixed(required, def);
  }

  if (zmAssert.mapOrRecord(field)) {
    return parseMap(
      required,
      field.valueSchema,
      def as zm.mDefault<
        Map<
          zm.UnwrapZodType<typeof field.keySchema>,
          zm.UnwrapZodType<typeof field.valueSchema>
        >
      >,
    );
  }

  if (zmAssert.effect(field)) {
    const effect = field._def.effect;

    if (effect.type === "refinement") {
      const validation = (<any>effect).__zm_validation as zm.EffectValidator<T>;
      return parseField(field._def.schema, required, def, validation);
    }

    if (effect.type === "preprocess" || effect.type === "transform") {
      return parseField(field._def.schema, required, def, refinement);
    }
  }

  return null;
}

function parseNumber(
  field: ZodNumber,
  required = true,
  def?: zm.mDefault<number>,
  unique = false,
  validate?: zm.EffectValidator<number>,
  sparse = false,
): zm.mNumber {
  const output: zm.mNumber = {
    type: Number,
    default: def,
    min: field.minValue ?? undefined,
    max: field.maxValue ?? undefined,
    required,
    unique,
    sparse,
  };

  if (validate) output.validate = validate;
  return output;
}

function parseString(
  field: ZodString,
  required = true,
  def?: zm.mDefault<string>,
  unique = false,
  validate?: zm.EffectValidator<string>,
  sparse = false,
): zm.mString {
  const output: zm.mString = {
    type: String,
    default: def,
    required,
    minLength: field.minLength ?? undefined,
    maxLength: field.maxLength ?? undefined,
    unique,
    sparse,
  };

  if (validate) output.validate = validate;
  return output;
}

function parseEnum(
  values: string[],
  required = true,
  def?: zm.mDefault<string>,
): zm.mString {
  return {
    type: String,
    unique: false,
    sparse: false,
    default: def,
    enum: values,
    required,
  };
}

function parseBoolean(required = true, def?: zm.mDefault<boolean>): zm.mBoolean {
  return {
    type: Boolean,
    default: def,
    required,
  };
}

function parseDate(
  required = true,
  def?: zm.mDefault<Date>,
  validate?: zm.EffectValidator<Date>,
  unique = false,
  sparse = false,
): zm.mDate {
  const output: zm.mDate = {
    type: Date,
    default: def,
    required,
    unique,
    sparse,
  };

  if (validate) output.validate = validate;
  return output;
}

function parseObjectId(
  required = true,
  ref?: string,
  unique = false,
  refPath?: string,
  sparse = false,
): zm.mObjectId {
  const output: zm.mObjectId = {
    type: SchemaTypes.ObjectId,
    required,
    unique,
    sparse,
  };

  if (ref) output.ref = ref;
  if (refPath) output.refPath = refPath;
  return output;
}

function parseArray<T>(
  required = true,
  element: ZodType<T>,
  def?: zm.mDefault<T[]>,
): zm.mArray<T> {
  const innerType = parseField(element);
  if (!innerType) throw new Error("Unsupported array type");
  return {
    type: [innerType as zm._Field<T>],
    default: def,
    required,
  };
}

function parseMap<T, K>(
  required = true,
  valueType: ZodType<K>,
  def?: zm.mDefault<Map<NoInfer<T>, K>>,
): zm.mMap<T, K> {
  const pointer = parseField(valueType);
  if (!pointer) throw new Error("Unsupported map value type");

  return {
    type: Map,
    of: pointer as zm._Field<K>,
    default: def,
    required,
  };
}

function parseUUID(
  required = true,
  ref?: string,
  unique = false,
  refPath?: string,
  sparse = false,
): zm.mUUID {
  const output: zm.mUUID = {
    type: SchemaTypes.UUID,
    required,
    unique,
    sparse,
  };
  if (ref) output.ref = ref;
  if (refPath) output.refPath = refPath;
  return output;
}

function parseMixed(required = true, def?: unknown): zm.mMixed<unknown> {
  return {
    type: SchemaTypes.Mixed,
    default: def as unknown as any,
    required,
  };
}

export default zodSchema;
