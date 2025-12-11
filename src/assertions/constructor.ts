import type {
  ZodAny,
  ZodArray,
  ZodBoolean,
  ZodDate,
  ZodDefault,
  ZodEffects,
  ZodEnum,
  ZodMap,
  ZodNativeEnum,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodRecord,
  ZodString,
  ZodType,
  ZodUnion,
} from "zod";
import type { IAsserts } from "./types";

/**
 * Constructor assertions (CommonJS)
 * @internal
 *
 * Asserts if a Zod type is a specific type
 * by checking the constructor name of it's prototype.
 */
export const zmAssert: IAsserts = {
  string(f: ZodType<any>): f is ZodString {
    return f.constructor.name === "ZodString";
  },

  number(f: ZodType<any>): f is ZodNumber {
    return f.constructor.name === "ZodNumber";
  },

  object(f: ZodType<any>): f is ZodObject<any> {
    return f.constructor.name === "ZodObject";
  },

  array(f: ZodType<any>): f is ZodArray<any> {
    return f.constructor.name === "ZodArray";
  },

  boolean(f: ZodType<any>): f is ZodBoolean {
    return f.constructor.name === "ZodBoolean";
  },

  enumerable(f: ZodType<any>): f is ZodEnum<any> {
    return f.constructor.name === "ZodEnum";
  },

  nativeEnumerable(f: ZodType<any>): f is ZodNativeEnum<any> {
    return f.constructor.name === "ZodNativeEnum";
  },

  date(f: ZodType<any>): f is ZodDate {
    return f.constructor.name === "ZodDate";
  },

  def(f: ZodType<any>): f is ZodDefault<any> {
    return f.constructor.name === "ZodDefault";
  },

  optional(f: ZodType<any>): f is ZodOptional<any> {
    return f.constructor.name === "ZodOptional";
  },

  nullable(f: ZodType<any>): f is ZodNullable<any> {
    return f.constructor.name === "ZodNullable";
  },

  union(f: ZodType<any>): f is ZodUnion<any> {
    return f.constructor.name === "ZodUnion";
  },

  any(f: ZodType<any>): f is ZodAny {
    return f.constructor.name === "ZodAny";
  },

  mapOrRecord(f: ZodType<any>): f is ZodMap<any> | ZodRecord<any> {
    return f.constructor.name === "ZodMap" || f.constructor.name === "ZodRecord";
  },

  effect(f: ZodType<any>): f is ZodEffects<any> {
    return f.constructor.name === "ZodEffects";
  },
};
