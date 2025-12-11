import {
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
  type ZodType,
  ZodUnion,
} from "zod";
import type { IAsserts } from "./types";

/**
 * Instance assertions (ESM)
 * @internal
 *
 * Asserts if a Zod type is a specific type
 * by checking the instance of it's prototype.
 */
export const zmAssert: IAsserts = {
  string(f: ZodType<any>): f is ZodString {
    return f instanceof ZodString;
  },

  number(f: ZodType<any>): f is ZodNumber {
    return f instanceof ZodNumber;
  },

  object(f: ZodType<any>): f is ZodObject<any> {
    return f instanceof ZodObject;
  },

  array(f: ZodType<any>): f is ZodArray<any> {
    return f instanceof ZodArray;
  },

  boolean(f: ZodType<any>): f is ZodBoolean {
    return f instanceof ZodBoolean;
  },

  enumerable(f: ZodType<any>): f is ZodEnum<any> {
    return f instanceof ZodEnum;
  },

  nativeEnumerable(f: ZodType<any>): f is ZodNativeEnum<any> {
    return f instanceof ZodNativeEnum;
  },

  date(f: ZodType<any>): f is ZodDate {
    return f instanceof ZodDate;
  },

  def(f: ZodType<any>): f is ZodDefault<any> {
    return f instanceof ZodDefault;
  },

  optional(f: ZodType<any>): f is ZodOptional<any> {
    return f instanceof ZodOptional;
  },

  nullable(f: ZodType<any>): f is ZodNullable<any> {
    return f instanceof ZodNullable;
  },

  union(f: ZodType<any>): f is ZodUnion<any> {
    return f instanceof ZodUnion;
  },

  any(f: ZodType<any>): f is ZodAny {
    return f instanceof ZodAny;
  },

  mapOrRecord(f: ZodType<any>): f is ZodMap<any> | ZodRecord<any> {
    return f instanceof ZodMap || f instanceof ZodRecord;
  },

  effect(f: ZodType<any>): f is ZodEffects<any> {
    return f instanceof ZodEffects;
  },
};
