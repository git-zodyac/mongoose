import type { ZodType } from "zod";

export namespace zmAssertIds {
  export function objectId(f: ZodType<any>): f is ZodType<string> {
    return "__zm_type" in f && f.__zm_type === "ObjectId";
  }

  export function uuid(f: ZodType<any>): f is ZodType<string> {
    return "__zm_type" in f && f.__zm_type === "UUID";
  }
}
