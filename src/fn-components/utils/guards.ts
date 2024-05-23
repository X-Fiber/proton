import type { NAbstractWsAdapter, NContextService } from "~types";

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

  public static isEvent(
    x: NContextService.Store
  ): x is NContextService.EventStore {
    return typeof x === "object" && "event" in x;
  }

  public static isEventStructure(
    x: unknown
  ): x is NAbstractWsAdapter.ClientEventStructure<NAbstractWsAdapter.EventKind> {
    return (
      typeof x === "object" &&
      x !== null &&
      "event" in x &&
      "payload" in x &&
      "kind" in x
    );
  }
}
