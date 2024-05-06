import { injectable, inject } from "~packages";
import { container } from "~container";
import { CoreSymbols } from "~symbols";

import type {
  HttpMethod,
  Nullable,
  IDiscoveryService,
  IRedisTunnel,
  ILoggerService,
  IPermissionProvider,
  NPermissionService,
} from "~types";

@injectable()
export class PermissionProvider implements IPermissionProvider {
  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService
  ) {}

  public async createRole(
    role: string,
    info: NPermissionService.RoleInfo
  ): Promise<void> {
    const provider = container.get<IRedisTunnel>(CoreSymbols.RedisTunnel);

    try {
      if (info.routes.length > 0) {
        const routes = info.routes.map((r) => r.route + "-" + r.method);

        await provider.set.add(`role:${role}:routes`, routes);
      }

      if (info.events.length > 0) {
        const events = info.events.map((r) => r.event + "-" + r.type);
        await provider.set.add(`role:${role}:events`, events);
      }
    } catch (e) {
      throw e;
    }
  }

  public async getRoleRoutes<
    R extends string = string,
    RU extends NPermissionService.Routes = NPermissionService.Routes
  >(role: R): Promise<RU | null> {
    try {
      const structures = await container
        .get<IRedisTunnel>(CoreSymbols.RedisTunnel)
        .set.get(`role:${role}:routes`);

      if (!structures) return null;

      const routes: NPermissionService.Routes = structures.map((r) => {
        const chunks = r.split("-");
        return {
          route: chunks[0],
          method: chunks[1] as HttpMethod,
        };
      });

      return routes as RU;
    } catch (e) {
      throw e;
    }
  }

  public async getRoleEvents<
    R extends string = string,
    EV extends NPermissionService.Events = NPermissionService.Events
  >(role: R): Promise<Nullable<EV>> {
    try {
      const structures = await container
        .get<IRedisTunnel>(CoreSymbols.RedisTunnel)
        .set.get(`role:${role}:events`);

      if (!structures) return null;

      const events = structures.map((r) => {
        const chunks = r.split("-");
        return {
          event: chunks[0],
          type: chunks[1],
        };
      });

      return events as EV;
    } catch (e) {
      throw e;
    }
  }

  public async removeRole(role: string): Promise<void> {
    try {
      await this.clearRoleRoutes(role);
      await this.clearRoleEvents(role);
    } catch (e) {
      throw e;
    }
  }

  public async clearRoleRoutes(role: string): Promise<void> {
    try {
      await container
        .get<IRedisTunnel>(CoreSymbols.RedisTunnel)
        .keys.delete(`role:${role}:routes`);
    } catch (e) {
      throw e;
    }
  }

  public async clearRoleEvents(role: string): Promise<void> {
    try {
      await container
        .get<IRedisTunnel>(CoreSymbols.RedisTunnel)
        .keys.delete(`role:${role}:events`);
    } catch (e) {
      throw e;
    }
  }

  public async addRoute(
    role: string,
    routes:
      | NPermissionService.RouteStructure
      | NPermissionService.RouteStructure[]
  ): Promise<void> {
    let records: string[];

    if (Array.isArray(routes)) {
      records = routes.map((r) => r.route + "-" + r.method);
    } else {
      records = [routes.route + "-" + routes.method];
    }

    try {
      await container
        .get<IRedisTunnel>(CoreSymbols.RedisTunnel)
        .set.add(`role:${role}:routes`, records);
    } catch (e) {
      throw e;
    }
  }

  public async removeRoute(
    role: string,
    routes:
      | NPermissionService.RouteStructure
      | NPermissionService.RouteStructure[]
  ): Promise<void> {
    let records: string[];

    if (Array.isArray(routes)) {
      records = routes.map((r) => r.route + "-" + r.method);
    } else {
      records = [routes.route + "-" + routes.method];
    }

    try {
      await container
        .get<IRedisTunnel>(CoreSymbols.RedisTunnel)
        .set.remove(`role:${role}:routes`, records);
    } catch (e) {
      throw e;
    }
  }

  public async addEvent(
    role: string,
    events:
      | NPermissionService.EventsStructure
      | NPermissionService.EventsStructure[]
  ): Promise<void> {
    let records: string[];

    if (Array.isArray(events)) {
      records = events.map((r) => r.event + "-" + r.type);
    } else {
      records = [events.event + "-" + events.type];
    }

    try {
      await container
        .get<IRedisTunnel>(CoreSymbols.RedisTunnel)
        .set.add(`role:${role}:events`, records);
    } catch (e) {
      throw e;
    }
  }

  public async removeEvent(
    role: string,
    events:
      | NPermissionService.EventsStructure
      | NPermissionService.EventsStructure[]
  ): Promise<void> {
    let records: string[];

    if (Array.isArray(events)) {
      records = events.map((r) => r.event + "-" + r.type);
    } else {
      records = [events.event + "-" + events.type];
    }

    try {
      await container
        .get<IRedisTunnel>(CoreSymbols.RedisTunnel)
        .set.remove(`role:${role}:events`, records);
    } catch (e) {
      throw e;
    }
  }
}
