import { HttpMethod, Nullable } from "../utils";

export interface IPermissionProvider {
  createRole<
    R extends string = string,
    I extends NPermissionService.RoleInfo = NPermissionService.RoleInfo
  >(
    role: R,
    info: I
  ): Promise<void>;
  getRoleRoutes<
    R extends string = string,
    RU extends NPermissionService.Routes = NPermissionService.Routes
  >(
    role: R
  ): Promise<Nullable<RU>>;
  getRoleEvents<
    R extends string = string,
    EV extends NPermissionService.Events = NPermissionService.Events
  >(
    role: R
  ): Promise<Nullable<EV>>;
  removeRole<R extends string = string>(role: R): Promise<void>;
  clearRoleRoutes<R extends string = string>(role: R): Promise<void>;
  clearRoleEvents<R extends string = string>(role: R): Promise<void>;
  addRoute<
    RO extends string = string,
    RU extends NPermissionService.Routes = NPermissionService.Routes
  >(
    role: RO,
    routes: RU
  ): Promise<void>;
  removeRoute<
    R extends string = string,
    RU extends NPermissionService.Routes = NPermissionService.Routes
  >(
    role: R,
    routes: RU
  ): Promise<void>;
  addEvent<
    E extends string = string,
    EV extends NPermissionService.Events = NPermissionService.Events
  >(
    role: E,
    events: EV
  ): Promise<void>;
  removeEvent<
    E extends string = string,
    EV extends NPermissionService.Events = NPermissionService.Events
  >(
    role: E,
    events: EV
  ): Promise<void>;
}

export namespace NPermissionService {
  export type RouteStructure<R extends string = string> = {
    method: HttpMethod;
    route: R;
  };

  export type Route = RouteStructure;
  export type Routes = Route[];

  export type EventsStructure<
    T extends string = string,
    E extends string = string
  > = { type: T; event: E };

  export type Event = EventsStructure;
  export type Events = Event[];

  export type RoleInfo = {
    routes: Routes;
    events: Events;
  };
}
