import { Types, isValidObjectId } from "mongoose";
import { type CustomErrorParams, z } from "zod";

declare module "zod" {
  interface ZodString {
    unique: (arg?: boolean) => ZodString;
    __zm_unique: boolean;
  }

  interface ZodNumber {
    unique: (arg?: boolean) => ZodNumber;
    __zm_unique: boolean;
  }

  interface ZodDate {
    unique: (arg?: boolean) => ZodDate;
    __zm_unique: boolean;
  }

  interface ZodType<
    Output = any,
    Def extends z.ZodTypeDef = z.ZodTypeDef,
    Input = Output,
  > {
    // For future use
  }
}

let zod_extended = false;
/**
 * Extends the Zod library with additional functionality.
 *
 * This function modifies the Zod library to add custom validation and uniqueness checks.
 * It ensures that the extension is only applied once.
 *
 * @param z_0 - The Zod library to extend.
 *
 * @remarks
 * - Overrides `refine` method to `ZodType` that includes additional metadata for validation.
 * - Overrides `unique` method to `ZodString`, `ZodNumber`, and `ZodDate` to mark them as unique.
 *
 * @example
 * ```typescript
 * import { z } from "zod";
 * import { extendZod } from "./extension";
 *
 * extendZod(z);
 *
 * const schema = z.object({
 *   name: z.string().unique();
 * });
 * ```
 */
export function extendZod(z_0: typeof z) {
  // Prevent zod from being extended multiple times
  if (zod_extended) return;
  zod_extended = true;

  // Refine support
  const _refine = z_0.ZodType.prototype.refine;
  z_0.ZodType.prototype.refine = function <T>(
    check: (arg0: T) => boolean,
    opts?: string | CustomErrorParams | ((arg: T) => CustomErrorParams),
  ) {
    const zEffect = _refine.bind(this)(check, opts);

    let message: string | undefined | ((v: T) => string | undefined) = undefined;
    if (opts) {
      if (typeof opts === "string") message = opts;
      else if ("message" in opts) message = opts.message;
    }

    (<any>zEffect._def.effect).__zm_validation = {
      validator: check,
      message: message,
    };

    return zEffect;
  };

  // Unique support
  const UNIQUE_SUPPORT_LIST = [z_0.ZodString, z_0.ZodNumber, z_0.ZodDate] as const;

  for (const type of UNIQUE_SUPPORT_LIST) {
    (<any>type.prototype).unique = function (arg = true) {
      (<any>this).__zm_unique = arg;
      return this;
    };
  }

  // Assign static names to Zod types
  const TypesMap = {
    String: z_0.ZodString,
    Number: z_0.ZodNumber,
    Object: z_0.ZodObject,
    Array: z_0.ZodArray,
    Boolean: z_0.ZodBoolean,
    Enum: z_0.ZodEnum,
    Date: z_0.ZodDate,
    Default: z_0.ZodDefault,
    Optional: z_0.ZodOptional,
    Nullable: z_0.ZodNullable,
    Union: z_0.ZodUnion,
    Any: z_0.ZodAny,
    Map: z_0.ZodMap,
    Record: z_0.ZodRecord,
    Effects: z_0.ZodEffects,
  };

  for (const [key, value] of Object.entries(TypesMap)) {
    (<any>value.prototype).__zm_type = key;
  }
}

export type TzmId = ReturnType<typeof createId> & {
  unique: (arg?: boolean) => TzmId;
  ref: (arg: string) => TzmId;
  refPath: (arg: string) => TzmId;
};

const createId = () => {
  return z
    .string()
    .refine((v) => isValidObjectId(v), { message: "Invalid ObjectId" })
    .or(z.instanceof(Types.ObjectId));
};

export const zId = (ref?: string): TzmId => {
  const output = createId();

  (<any>output).__zm_type = "ObjectId";
  (<any>output).__zm_ref = ref;

  (<any>output).ref = function (ref: string) {
    (<any>this).__zm_ref = ref;
    return this;
  };

  (<any>output).refPath = function (ref: string) {
    (<any>this).__zm_refPath = ref;
    return this;
  };

  (<any>output).unique = function (val = true) {
    (<any>this).__zm_unique = val;
    return this;
  };

  return output as TzmId;
};

export type TzmUUID = ReturnType<typeof createUUID> & {
  unique: (arg?: boolean) => TzmUUID;
  ref: (arg: string) => TzmUUID;
  refPath: (arg: string) => TzmUUID;
};

const createUUID = () => {
  return z.string().uuid({ message: "Invalid UUID" }).or(z.instanceof(Types.UUID));
};

export const zUUID = (ref?: string): TzmUUID => {
  const output = createUUID();

  (<any>output).__zm_type = "UUID";
  (<any>output).__zm_ref = ref;

  (<any>output).ref = function (ref: string) {
    (<any>this).__zm_ref = ref;
    return this;
  };

  (<any>output).refPath = function (ref: string) {
    (<any>this).__zm_refPath = ref;
    return this;
  };

  (<any>output).unique = function (val = true) {
    (<any>this).__zm_unique = val;
    return this;
  };

  return output as TzmUUID;
};
