import type { WorkerPool } from "../../packages";
import type { IAbstractService } from "./abstract.service";
import type { NDiscoveryService } from "./discovery.service";

export interface ITaskScheduler<
  K = string,
  V extends NTaskScheduler.Task = NTaskScheduler.Task
> {
  on(
    event: "first",
    listener: (key: K, val: NTaskScheduler.TimePayload) => void
  ): void;
  on(
    event: "next",
    listener: (key: K, val: NTaskScheduler.TimePayload) => void
  ): void;
  on<T = unknown>(
    event: "success",
    listener: (key: K, val?: NTaskScheduler.OnSuccess<T>) => void
  ): void;
  on<T = unknown>(
    event: "error",
    listener: (key: K, val?: NTaskScheduler.OnError<T>) => void
  ): void;
  on(event: "delete", listener: (key: K) => void): void;
  on(event: string | symbol, listener: (...args: any[]) => void): void;

  once(event: string | symbol, listener: (...args: any[]) => void): void;
  removeListener(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): void;

  set(key: K, value: V): this;
  get(key: K): V | undefined;
  delete(key: K): boolean;
  destroy(): void;
}

export namespace NTaskScheduler {
  export type Event = "set" | "success" | "error" | "delete" | "next" | "first";

  export type PeriodKind =
    | "minutely"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "interval"
    | "disposable";

  type DateStructure = {
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
    month: number;
    weeklyDay: number;
  };

  interface ISchedulerKind {
    kind: PeriodKind;
  }

  interface MinutelyKind extends ISchedulerKind {
    kind: "minutely";
    time: Pick<DateStructure, "seconds">;
  }

  interface HourlyKind extends ISchedulerKind {
    kind: "hourly";
    time: Pick<DateStructure, "seconds" | "minutes">;
  }

  interface DailyKind extends ISchedulerKind {
    kind: "daily";
    time: Pick<DateStructure, "seconds" | "minutes" | "hours">;
  }

  export type WeeklyStructure = Pick<
    DateStructure,
    "seconds" | "minutes" | "hours" | "weeklyDay"
  >;
  interface WeeklyKind extends ISchedulerKind {
    kind: "weekly";
    time: WeeklyStructure;
  }

  interface MonthlyKind extends ISchedulerKind {
    kind: "monthly";
    time: Pick<DateStructure, "seconds" | "minutes" | "hours" | "days">;
  }

  type YearStructure = Pick<
    DateStructure,
    "seconds" | "minutes" | "hours" | "days" | "month"
  >;

  interface YearlyKind extends ISchedulerKind {
    kind: "yearly";
    time: YearStructure;
  }

  interface IntervalKind extends ISchedulerKind {
    kind: "interval";
    time: Pick<DateStructure, "seconds">;
  }

  interface DisposableKind extends ISchedulerKind {
    kind: "disposable";
    time: YearStructure;
  }

  type TimeKind =
    | MinutelyKind
    | HourlyKind
    | DailyKind
    | WeeklyKind
    | MonthlyKind
    | YearlyKind
    | IntervalKind
    | DisposableKind;

  export type SchedulerOptions = {
    workers?: WorkerPool.WorkerPoolOptions;
    periodicity?: number;
  };

  export type Task = {
    args?: any;
    job: (...args: any[]) => any;
    time: TimeKind;
  };

  export type TimePayload = {
    timestamp: number;
    date: Date;
    kind: TimeKind;
  };

  export type OnError<T> = {
    task: Task;
    time: Date;
    message: T;
  };

  export type OnSuccess<T> = {
    task: Task;
    time: Date;
    result: T;
  };
}

export interface ITaskService extends IAbstractService {
  on<K extends string>(
    event: "first",
    listener: (key: K, val: NTaskScheduler.TimePayload) => void
  ): void;
  on<K extends string>(
    event: "next",
    listener: (key: K, val: NTaskScheduler.TimePayload) => void
  ): void;
  on<K extends string, T = unknown>(
    event: "success",
    listener: (key: K, val?: NTaskScheduler.OnSuccess<T>) => void
  ): void;
  on<T = unknown>(
    event: "error",
    listener: (key: K, val?: NTaskScheduler.OnError<T>) => void
  ): void;
  on<K extends string>(event: "delete", listener: (key: K) => void): void;
  on(event: string | symbol, listener: (...args: any[]) => void): void;

  once(event: string | symbol, listener: (...args: any[]) => void): void;
  removeListener(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): void;

  set<K extends string>(key: K, value: NTaskScheduler.Task): ITaskScheduler;
  get<K extends string>(key: K): NTaskScheduler.Task | undefined;
  delete<K extends string>(key: K): boolean;
  destroy(): void;
}

export namespace NTaskService {
  export type Config = Pick<
    NDiscoveryService.CoreConfig["services"]["scheduler"],
    "enable" | "maxTask" | "periodicity" | "workers"
  >;
}
