import {
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

export namespace zmAssert {
  export function string(f: ZodType<any>): f is ZodString {
    return f.constructor.name === "ZodString";
  }

  export function number(f: ZodType<any>): f is ZodNumber {
    return f.constructor.name === "ZodNumber";
  }

  export function object(f: ZodType<any>): f is ZodObject<any> {
    return f.constructor.name === "ZodObject";
  }

  export function array(f: ZodType<any>): f is ZodArray<any> {
    return f.constructor.name === "ZodArray";
  }

  export function boolean(f: ZodType<any>): f is ZodBoolean {
    return f.constructor.name === "ZodBoolean";
  }

  export function enumerable(f: ZodType<any>): f is ZodEnum<any> {
    return f.constructor.name === "ZodEnum";
  }

  export function date(f: ZodType<any>): f is ZodDate {
    return f.constructor.name === "ZodDate";
  }

  export function objectId(f: ZodType<any>): f is ZodType<string> {
    return "__zm_type" in f && f.__zm_type === "ObjectId";
  }

  export function uuid(f: ZodType<any>): f is ZodType<string> {
    return "__zm_type" in f && f.__zm_type === "UUID";
  }

  export function def(f: ZodType<any>): f is ZodDefault<any> {
    return f.constructor.name === "ZodDefault";
  }

  export function optional(f: ZodType<any>): f is ZodOptional<any> {
    return f.constructor.name === "ZodOptional";
  }

  export function nullable(f: ZodType<any>): f is ZodNullable<any> {
    return f.constructor.name === "ZodNullable";
  }

  export function union(f: ZodType<any>): f is ZodUnion<any> {
    return f.constructor.name === "ZodUnion";
  }

  export function any(f: ZodType<any>): f is ZodAny {
    return f.constructor.name === "ZodAny";
  }

  export function mapOrRecord(
    f: ZodType<any>
  ): f is ZodMap<any> | ZodRecord<any> {
    return (
      f.constructor.name === "ZodMap" || f.constructor.name === "ZodRecord"
    );
  }

  export function effect(f: ZodType<any>): f is ZodEffects<any> {
    return f.constructor.name === "ZodEffects";
  }
}
