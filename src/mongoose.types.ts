import { SchemaTypes, Types } from "mongoose";

export namespace zm {
  export interface _Field<T> {
    required: boolean;
    default?: T;
    validation?: {
      validate: (v: T) => boolean;
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
  }

  export interface mObjectId extends _Field<Types.ObjectId> {
    type: typeof SchemaTypes.ObjectId;
    ref?: string;
  }

  export interface mUUID extends _Field<Types.UUID> {
    type: typeof SchemaTypes.UUID;
    ref?: string;
  }

  export type mArray<K> = [_Field<K[]>];

  export interface mMixed<T> extends _Field<T> {
    type: typeof SchemaTypes.Mixed;
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
    | _Schema<unknown>;

  export type _Schema<T> = {
    [K in keyof T]: _Field<T[K]> | _Schema<T[K]>;
  };
}
