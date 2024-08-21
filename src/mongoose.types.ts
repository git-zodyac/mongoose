import type { SchemaTypes, Types } from "mongoose";
import type { ZodType, z } from "zod";

export namespace zm {
  export interface zID
    extends z.ZodUnion<
      [z.ZodString, z.ZodType<Types.ObjectId, z.ZodTypeDef, Types.ObjectId>]
    > {
    __zm_type: "ObjectId";
    __zm_ref?: string;
    ref: (ref: string) => zID;
    unique: (val?: boolean) => zID;
  }

  export interface zUUID
    extends z.ZodUnion<[z.ZodString, z.ZodType<Types.UUID, z.ZodTypeDef, Types.UUID>]> {
    __zm_type: "UUID";
    unique: (val?: boolean) => zID;
  }

  export interface _Field<T> {
    required: boolean;
    default?: T;
    validate?: {
      validator: (v: T) => boolean;
      message?: string;
    };
  }

  export interface mString extends _Field<string> {
    type: StringConstructor;
    unique: boolean;
    enum?: string[];
    match?: RegExp;
    minLength?: number;
    maxLength?: number;
  }

  export interface mNumber extends _Field<number> {
    type: NumberConstructor;
    unique: boolean;
    min?: number;
    max?: number;
  }

  export interface mBoolean extends _Field<boolean> {
    type: BooleanConstructor;
  }

  export interface mDate extends _Field<Date> {
    type: DateConstructor;
    unique: boolean;
  }

  export interface mObjectId extends _Field<Types.ObjectId> {
    type: typeof SchemaTypes.ObjectId;
    unique?: boolean;
    ref?: string;
  }

  export interface mUUID extends _Field<Types.UUID> {
    type: typeof SchemaTypes.UUID;
    unique?: boolean;
    ref?: string;
  }

  export interface mArray<K> extends _Field<K[]> {
    type: [_Field<K>];
  }

  export interface mMixed<T> extends _Field<T> {
    type: typeof SchemaTypes.Mixed;
  }

  export type Constructor =
    | StringConstructor
    | NumberConstructor
    | ObjectConstructor
    | DateConstructor
    | BooleanConstructor
    | BigIntConstructor;

  export interface mMap<T, K> extends _Field<Map<T, K>> {
    type: typeof Map;
    of?: Constructor;
  }

  export type mField =
    // Primitives
    | mString
    | mNumber
    | mBoolean
    | mDate

    // IDs
    | mObjectId
    | mUUID

    // Mixed types
    | mMixed<unknown>
    | mArray<unknown>
    | _Schema<unknown>
    | mMap<unknown, unknown>;

  export type _Schema<T> = {
    [K in keyof T]: _Field<T[K]> | _Schema<T[K]>;
  };

  export type UnwrapZodType<T> = T extends ZodType<infer K> ? K : never;
  export type EffectValidator<T> = {
    validator: (v: T) => boolean;
    message?: string;
  };
}
