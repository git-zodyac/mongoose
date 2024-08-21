import { Schema, SchemaTypes } from "mongoose";
import {
  ZodArray,
  ZodBoolean,
  ZodDate,
  ZodDefault,
  ZodEffects,
  ZodEnum,
  ZodMap,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  type ZodRawShape,
  ZodRecord,
  ZodString,
  type ZodType,
  ZodUnion,
  type z,
} from "zod";
import type { zm } from "./mongoose.types.js";

/**
 * Converts a Zod schema to a Mongoose schema
 * @param schema zod schema to parse
 * @returns mongoose schema
 *
 * @example
 * import { zId, zodSchema } from '@zodyac/zod-mongoose';
 * import { model } from 'mongoose';
 * import { z } from 'zod';
import { Constructor } from './mongoose.types';
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
export function zodSchemaRaw<T extends ZodRawShape>(schema: ZodObject<T>): zm._Schema<T> {
  return parseObject(schema);
}

// Helpers
function parseObject<T extends ZodRawShape>(obj: ZodObject<T>): zm._Schema<T> {
  const object: any = {};
  for (const [key, field] of Object.entries(obj.shape)) {
    if (field instanceof ZodObject) {
      object[key] = parseObject(field);
    } else {
      const f = parseField(field);
      if (!f) throw new Error(`Unsupported field type: ${field.constructor}`);

      object[key] = f;
    }
  }

  return object;
}

function parseField<T>(
  field: ZodType<T>,
  required = true,
  def?: T,
  refinement?: zm.EffectValidator<T>,
): zm.mField | null {
  const field_type = field.constructor.name;

  if ("__zm_type" in field && field.__zm_type === "ObjectId") {
    const ref = (<any>field).__zm_ref;
    if (ref) return parseObjectIdRef(required, ref);
    return parseObjectId(required);
  }

  if ("__zm_type" in field && field.__zm_type === "UUID") {
    const ref = (<any>field).__zm_ref;

    if (ref) return parseUUIDRef(required, ref);
    return parseUUID(required);
  }

  if (field instanceof ZodObject) {
    return parseObject(field);
  }

  if (field instanceof ZodNumber) {
    const isUnique = field.__zm_unique ?? false;
    return parseNumber(
      field,
      required,
      def as number,
      isUnique,
      refinement as zm.EffectValidator<number>,
    );
  }

  if (field instanceof ZodString) {
    const isUnique = field.__zm_unique ?? false;
    return parseString(
      field,
      required,
      def as string,
      isUnique,
      refinement as zm.EffectValidator<string>,
    );
  }

  if (field instanceof ZodEnum) {
    return parseEnum(Object.keys(field.Values), required, def as string);
  }

  if (field_type === "ZodBoolean") {
    return parseBoolean(required, def as boolean);
  }

  if (field instanceof ZodDate) {
    const isUnique = field.__zm_unique ?? false;
    return parseDate(
      required,
      def as Date,
      refinement as zm.EffectValidator<Date>,
      isUnique,
    );
  }

  if (field instanceof ZodArray) {
    return parseArray(
      required,
      field.element,
      def as T extends Array<infer K> ? K[] : never,
    );
  }

  if (field instanceof ZodDefault) {
    return parseField(field._def.innerType, required, field._def.defaultValue());
  }

  if (field instanceof ZodOptional) {
    return parseField(field._def.innerType, false, undefined);
  }

  if (field instanceof ZodNullable) {
    return parseField(field._def.innerType, false, def || null);
  }

  if (field instanceof ZodUnion) {
    return parseField(field._def.options[0]);
  }

  if (field_type === "ZodAny") {
    return parseMixed(required, def);
  }

  if (field instanceof ZodMap || field instanceof ZodRecord) {
    return parseMap(
      required,
      field.keySchema,
      def as Map<
        zm.UnwrapZodType<typeof field.keySchema>,
        zm.UnwrapZodType<typeof field.valueSchema>
      >,
    );
  }

  if (field instanceof ZodEffects) {
    const effect = field._def.effect;

    if (effect.type === "refinement") {
      const validation = (<any>effect).__zm_validation as zm.EffectValidator<T>;
      return parseField(field._def.schema, required, def, validation);
    }
  }

  return null;
}

function parseNumber(
  field: ZodNumber,
  required = true,
  def?: number,
  unique = false,
  validate?: zm.EffectValidator<number>,
): zm.mNumber {
  const output: zm.mNumber = {
    type: Number,
    default: def,
    min: field.minValue ?? undefined,
    max: field.maxValue ?? undefined,
    required,
    unique,
  };

  if (validate) output.validate = validate;
  return output;
}

function parseString(
  field: ZodString,
  required = true,
  def?: string,
  unique = false,
  validate?: zm.EffectValidator<string>,
): zm.mString {
  const output: zm.mString = {
    type: String,
    default: def,
    required,
    minLength: field.minLength ?? undefined,
    maxLength: field.maxLength ?? undefined,
    unique,
  };

  if (validate) output.validate = validate;
  return output;
}

function parseEnum(values: string[], required = true, def?: string): zm.mString {
  return {
    type: String,
    unique: false,
    default: def,
    enum: values,
    required,
  };
}

function parseBoolean(required = true, def?: boolean): zm.mBoolean {
  return {
    type: Boolean,
    default: def,
    required,
  };
}

function parseDate(
  required = true,
  def?: Date,
  validate?: zm.EffectValidator<Date>,
  unique = false,
): zm.mDate {
  const output: zm.mDate = {
    type: Date,
    default: def,
    required,
    unique,
  };

  if (validate) output.validate = validate;
  return output;
}

function parseObjectId(required = true): zm.mObjectId {
  return {
    type: SchemaTypes.ObjectId,
    required,
  };
}

// biome-ignore lint/style/useDefaultParameterLast: Should be consistent with other functions
function parseArray<T>(required = true, element: ZodType<T>, def?: T[]): zm.mArray<T> {
  const innerType = parseField(element);
  if (!innerType) throw new Error("Unsupported array type");
  return {
    type: [innerType as zm._Field<T>],
    default: def,
    required,
  };
}

function parseMap<T, K>(
  // biome-ignore lint/style/useDefaultParameterLast: Consistency
  required = true,
  key: ZodType<T>,
  def?: Map<NoInfer<T>, K>,
): zm.mMap<T, K> {
  const pointer = typeConstructor(key);
  return {
    type: Map,
    of: pointer,
    default: def,
    required,
  };
}

function typeConstructor<T>(t: ZodType) {
  switch (true) {
    case t instanceof ZodString:
      return String;
    case t instanceof ZodNumber:
      return Number;
    case t instanceof ZodObject:
      return Object;
    case t instanceof ZodDate:
      return Date;
    case t instanceof ZodBoolean:
      return Boolean;
    default:
      return undefined;
  }
}

// biome-ignore lint/style/useDefaultParameterLast: Should be consistent with other functions
function parseObjectIdRef(required = true, ref: string): zm.mObjectId {
  return {
    type: SchemaTypes.ObjectId,
    required,
    ref,
  };
}

function parseUUID(required = true): zm.mUUID {
  return {
    type: SchemaTypes.UUID,
    required,
  };
}

// biome-ignore lint/style/useDefaultParameterLast: Should be consistent with other functions
function parseUUIDRef(required = true, ref: string): zm.mUUID {
  return {
    type: SchemaTypes.UUID,
    required,
    ref,
  };
}

function parseMixed(required = true, def?: unknown): zm.mMixed<unknown> {
  return {
    type: SchemaTypes.Mixed,
    default: def,
    required,
  };
}

export default zodSchema;
