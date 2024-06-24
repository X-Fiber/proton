import { NAbstractWsAdapter, NContextService, NManagerService } from "~types";

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

  public static isManagerScope(x: string): x is NManagerService.Scope {
    const scopes: NManagerService.Scope[] = ["auth", "logger", "discovery"];
    return scopes.some((s) => s === x);
  }

  public static isAuthCommands(x: string): x is NManagerService.Scope {
    const scopes: NManagerService.LoginCommands[] = ["login"];
    return scopes.some((s) => s === x);
  }

  public static isLoggerCommands(x: string): x is NManagerService.Scope {
    const scopes: NManagerService.LoggerCommands[] = [
      "set-logger-level",
      "set-logger-transport",
    ];
    return scopes.some((s) => s === x);
  }

  public static isDiscoveryCommands(
    x: string
  ): x is NManagerService.DiscoveryCommands {
    const scopes: NManagerService.DiscoveryCommands[] = [
      "get-service-status",
      "get-service-config",
      "reload-core-config",
      "reload-scheme-config",
    ];

    return scopes.some((s) => s === x);
  }
}
