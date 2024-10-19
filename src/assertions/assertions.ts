import type { ZodType } from "zod";
import { zmAssert as aConstructor } from "./constructor";
import { zmAssertIds } from "./custom";
import { zmAssert as aInstance } from "./instanceOf";
import { zmAssert as aStaticName } from "./staticNames";
import type { IAsserts } from "./types";

const assertions = [aConstructor, aInstance, aStaticName];
const zmAssert = Object.keys(aConstructor)
  .map((key) => key as keyof IAsserts)
  .reduce((acc, key) => {
    (<any>acc[key]) = (f: ZodType<any>) => {
      return assertions.some((assertion) => assertion[key](f));
    };

    return acc;
  }, {} as IAsserts);

export default {
  ...zmAssert,
  ...zmAssertIds,
};
