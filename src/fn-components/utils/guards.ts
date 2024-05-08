import type { NContextService } from "~types";

export class Guards {
  public static isNotUndefined(x: undefined | any): boolean {
    return typeof x !== "undefined";
  }

  public static isString(x: string | unknown): x is string {
    return typeof x === "string";
  }

  public static isRoute(
    x: NContextService.Store
  ): x is NContextService.RouteStore {
    return typeof x === "object" && "action" in x;
  }
}
