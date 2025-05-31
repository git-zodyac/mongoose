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
 * Static names assertions (Bundlers)
 * @internal
 *
 * Asserts if a Zod type is a specific type
 * by checking the `__zm_type` property of it's prototype.
 */
export const zmAssert: IAsserts = {
  string(f: ZodType<any>): f is ZodString {
    return "__zm_type" in f && f.__zm_type === "String";
  },

  number(f: ZodType<any>): f is ZodNumber {
    return "__zm_type" in f && f.__zm_type === "Number";
  },

  object(f: ZodType<any>): f is ZodObject<any> {
    return "__zm_type" in f && f.__zm_type === "Object";
  },

  array(f: ZodType<any>): f is ZodArray<any> {
    return "__zm_type" in f && f.__zm_type === "Array";
  },

  boolean(f: ZodType<any>): f is ZodBoolean {
    return "__zm_type" in f && f.__zm_type === "Boolean";
  },

  enumerable(f: ZodType<any>): f is ZodEnum<any> {
    return "__zm_type" in f && f.__zm_type === "Enum";
  },

  nativeEnum(f: ZodType<any>): f is ZodNativeEnum<any> {
    return "__zm_type" in f && f.__zm_type === "NativeEnum";
  },

  date(f: ZodType<any>): f is ZodDate {
    return "__zm_type" in f && f.__zm_type === "Date";
  },

  def(f: ZodType<any>): f is ZodDefault<any> {
    return "__zm_type" in f && f.__zm_type === "Default";
  },

  optional(f: ZodType<any>): f is ZodOptional<any> {
    return "__zm_type" in f && f.__zm_type === "Optional";
  },

  nullable(f: ZodType<any>): f is ZodNullable<any> {
    return "__zm_type" in f && f.__zm_type === "Nullable";
  },

  union(f: ZodType<any>): f is ZodUnion<any> {
    return "__zm_type" in f && f.__zm_type === "Union";
  },

  any(f: ZodType<any>): f is ZodAny {
    return "__zm_type" in f && f.__zm_type === "Any";
  },

  mapOrRecord(f: ZodType<any>): f is ZodMap<any> | ZodRecord<any> {
    return "__zm_type" in f && (f.__zm_type === "Map" || f.__zm_type === "Record");
  },

  effect(f: ZodType<any>): f is ZodEffects<any> {
    return "__zm_type" in f && f.__zm_type === "Effects";
  },
};
