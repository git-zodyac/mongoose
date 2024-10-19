import type {
  ZodAny,
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
  ZodRecord,
  ZodString,
  ZodType,
  ZodUnion,
} from "zod";

export interface IAsserts {
  string(f: ZodType<any>): f is ZodString;
  number(f: ZodType<any>): f is ZodNumber;
  object(f: ZodType<any>): f is ZodObject<any>;
  array(f: ZodType<any>): f is ZodArray<any>;
  boolean(f: ZodType<any>): f is ZodBoolean;
  enumerable(f: ZodType<any>): f is ZodEnum<any>;
  date(f: ZodType<any>): f is ZodDate;
  def(f: ZodType<any>): f is ZodDefault<any>;
  optional(f: ZodType<any>): f is ZodOptional<any>;
  nullable(f: ZodType<any>): f is ZodNullable<any>;
  union(f: ZodType<any>): f is ZodUnion<any>;
  any(f: ZodType<any>): f is ZodAny;
  mapOrRecord(f: ZodType<any>): f is ZodMap<any> | ZodRecord<any>;
  effect(f: ZodType<any>): f is ZodEffects<any>;
}
