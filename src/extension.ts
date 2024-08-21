import { Types, isValidObjectId } from "mongoose";
import type { zm } from "mongoose.types";
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

  namespace z {
    function objectId(ref?: string): zm.zID;
    function mongoUUID(): zm.zUUID;
  }

  // TODO: unique ObjectID
  // TODO: unique UUID
}

export function extendZod(z_0: typeof z) {
  // Prevent zod from being extended multiple times
  if ((<any>z_0).__zm_extended) return;
  (<any>z_0).__zm_extended = true;

  const _refine = z_0.ZodType.prototype.refine;
  z_0.ZodType.prototype.refine = function <T>(
    check: (arg0: T) => boolean,
    opts: string | CustomErrorParams | ((arg: T) => CustomErrorParams),
  ) {
    const zEffect = _refine.bind(this)(check, opts);

    let message: string | undefined | ((v: T) => string | undefined) = undefined;
    if (typeof opts === "string") message = opts;
    else if ("message" in opts) message = opts.message;

    (<any>zEffect._def.effect).__zm_validation = {
      validator: check,
      message: message,
    };

    return zEffect;
  };

  z_0.ZodString.prototype.unique = function (arg = true) {
    this.__zm_unique = arg;
    return this;
  };

  z_0.ZodNumber.prototype.unique = function (arg = true) {
    this.__zm_unique = arg;
    return this;
  };

  z_0.ZodDate.prototype.unique = function (arg = true) {
    this.__zm_unique = arg;
    return this;
  };

  (<any>z_0).objectId = (ref?: string) => {
    const output = z
      .string()
      .refine((v) => isValidObjectId(v), { message: "Invalid ObjectId" })
      .or(z.instanceof(Types.ObjectId).describe("ObjectId"));

    (<any>output).__zm_type = "ObjectId";
    (<any>output).__zm_ref = ref;

    (<any>output).ref = function (ref: string) {
      (<any>this).__zm_ref = ref;
      return this;
    };

    (<any>output).unique = function (val = true) {
      (<any>this).__zm_unique = val;
      return this;
    };

    return output;
  };

  (<any>z_0).mongoUUID = () => {
    const output = z
      .string()
      .uuid({ message: "Invalid UUID" })
      .or(z.instanceof(Types.UUID).describe("UUID"));
    (<any>output).__zm_type = "UUID";

    (<any>output).unique = function (val = true) {
      (<any>this).__zm_unique = val;
      return this;
    };

    return output;
  };
}
