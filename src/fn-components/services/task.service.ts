import { events, inject, injectable, workerpool } from "~packages";
import { CoreSymbols } from "~symbols";
import { AbstractService } from "./abstract.service";

import type {
  WorkerPool,
  IDiscoveryService,
  ILoggerService,
  ITaskScheduler,
  ITaskService,
  NTaskScheduler,
  NTaskService,
} from "~types";

class TaskScheduler<K extends string, V extends NTaskScheduler.Task>
  extends Map<K, V>
  implements ITaskScheduler
{
  private readonly _periodicity: number;

  private readonly _interval: NodeJS.Timeout;
  private readonly _emitter: NodeJS.EventEmitter;
  private readonly _scheduler: Map<K, number>;
  private readonly _workers: WorkerPool.WorkerPool | undefined;

  constructor(options: NTaskScheduler.SchedulerOptions = {}) {
    super();
    this._periodicity = options.periodicity ?? 1000;
    this._interval = setInterval(() => this._execute(), this._periodicity);
    this._emitter = new events.EventEmitter();
    this._scheduler = new Map();

    if (options.workers) {
      this._workers = workerpool.pool(options.workers);
    }

    this._interval.unref();
  }

  public on(
    event: "first",
    listener: (key: K, val: NTaskScheduler.TimePayload) => void
  ): void;
  public on(
    event: "next",
    listener: (key: K, val: NTaskScheduler.TimePayload) => void
  ): void;
  public on<T = unknown>(
    event: "success",
    listener: (key: K, val: NTaskScheduler.OnSuccess<T>) => void
  ): void;
  public on<T = unknown>(
    event: "error",
    listener: (key: K, val: NTaskScheduler.OnError<T>) => void
  ): void;
  public on(event: "delete", listener: (key: K) => void): void;
  public on(event: string | symbol, listener: (...args: any[]) => void): void {
    this._emitter.on(event, listener);
  }

  public once(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): void {
    this._emitter.once(event, listener);
  }

  public removeListener(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): void {
    this._emitter.removeListener(event, listener);
  }

  public set(key: K, value: V): this {
    this._emitter.emit("set", key, value);
    this._scheduler.set(key, this._getExecTime(value.time, key));
    return super.set(key, value);
  }

  public get(key: K): V | undefined {
    return super.get(key);
  }

  public delete(key: K): boolean {
    this._emitter.emit("delete", key);
    this._scheduler.delete(key);
    return super.delete(key);
  }

  public destroy(): void {
    clearInterval(this._interval);
    this.clear();
  }

  private async _execute(): Promise<void> {
    const now = Date.now();

    for (const [key, execTime] of this._scheduler) {
      const task = this.get(key);
      if (!task) {
        throw new Error(`Task "${key}" not found`);
      }

      if (now >= execTime) {
        try {
          let result = this._workers
            ? await this._workers.exec(task.job, task.args)
            : await task.job(task.args);
          if (result === undefined || result === null) result = null;
          this._scheduler.set(
            key,
            this._getNextExecTime(execTime, task.time.kind, key)
          );

          this._emitter.emit("success", key, {
            task,
            result,
            time: new Date(),
          });
        } catch (e: unknown) {
          this._emitter.emit("error", key, {
            task,
            time: new Date(),
            message: e,
          });
        }
        this._scheduler.delete(key);
      }
    }
  }

  private _getExecTime(timer: NTaskScheduler.TimeKind, key: K): number {
    let { eSeconds, eMinutes, eHours, eDays, eWeekDay, eMonth, eYear } =
      this._getCurrentDate();

    switch (timer.kind) {
      case "minutely":
        if (eSeconds > timer.time.seconds) eMinutes += 1;
        eSeconds = timer.time.seconds;
        break;
      case "hourly":
        if (eMinutes > timer.time.minutes) eHours += 1;
        eMinutes = timer.time.minutes;
        eSeconds = timer.time.seconds;
        break;
      case "daily":
        if (eHours > timer.time.hours) eDays += 1;
        eHours = timer.time.hours;
        eMinutes = timer.time.minutes;
        eSeconds = timer.time.seconds;
        break;
      case "weekly":
        eSeconds = timer.time.seconds;
        eMinutes = timer.time.minutes;
        eHours = timer.time.hours;
        eWeekDay = eDays + this._getWeeklyDiff(timer.time);
        eDays = new Date(eYear, eMonth, eWeekDay).getDate();
        break;
      case "yearly":
        if (eMonth > timer.time.month) eYear += 1;
        eMonth = timer.time.month;
        eDays = timer.time.days;
        eHours = timer.time.hours;
        eMinutes = timer.time.minutes;
        eSeconds = timer.time.seconds;
        break;
      case "disposable":
        eMonth = timer.time.month;
        eDays = timer.time.days;
        eHours = timer.time.hours;
        eMinutes = timer.time.minutes;
        eSeconds = timer.time.seconds;
        break;
      case "interval":
        return timer.time.seconds;
      default:
        return new Date(3000, 0, 1).getTime();
    }

    const executeDate = new Date(
      eYear,
      eMonth,
      eDays,
      eHours,
      eMinutes,
      eSeconds
    );

    this._emitter.emit("first", key, {
      date: new Date(executeDate),
      kind: timer.kind,
    });

    return executeDate.getTime();
  }

  private _getNextExecTime(
    timestamp: number,
    kind: NTaskScheduler.PeriodKind,
    key: K
  ): number {
    let nextTime = 1000;
    const currentDate = new Date();

    const monthIndex = new Date(currentDate).getMonth();

    const lastDayOfMonth = new Date(0);
    lastDayOfMonth.setFullYear(currentDate.getFullYear(), monthIndex + 1, 0);
    lastDayOfMonth.setHours(0, 0, 0, 0);
    const getDayIsMonth = lastDayOfMonth.getDate();

    const dayIsYear = new Date(0) ? 366 : 365;

    switch (kind) {
      case "minutely":
        nextTime = timestamp + nextTime * 60;
        break;
      case "hourly":
        nextTime = timestamp + nextTime * 60 * 60;
        break;
      case "daily":
        nextTime = timestamp + nextTime * 60 * 60 * 24;
        break;
      case "weekly":
        nextTime = timestamp + nextTime * 60 * 60 * 24 * 7;
        break;
      case "monthly":
        nextTime = timestamp + nextTime * 60 * 60 * 24 * getDayIsMonth;
        break;
      case "yearly":
        nextTime = timestamp + nextTime * 60 * 60 * 24 * dayIsYear;
        break;
    }

    this._emitter.emit("next", key, {
      date: new Date(nextTime),
      kind,
    });
    return nextTime;
  }

  private _getWeeklyDiff(date: NTaskScheduler.WeeklyStructure): number {
    const { eYear, eMonth, eHours, eMinutes, eSeconds, eDays } =
      this._getCurrentDate();

    const cWeeklyDay = new Date(eYear, eMonth, eDays).getDay();
    const eWeeklyDay = new Date(eYear, eMonth, date.weeklyDay - 1).getDay();

    const cTime = new Date(
      eYear,
      eMonth,
      cWeeklyDay,
      eHours,
      eMinutes,
      eSeconds
    );
    const eTime = new Date(
      eYear,
      eMonth,
      eWeeklyDay,
      date.hours,
      date.minutes,
      date.seconds
    );

    return cTime > eTime
      ? 7 - (cWeeklyDay - eWeeklyDay)
      : eWeeklyDay - cWeeklyDay;
  }

  private _getCurrentDate() {
    const currentDate = new Date();

    return {
      eSeconds: currentDate.getSeconds(),
      eMinutes: currentDate.getMinutes(),
      eHours: currentDate.getHours(),
      eDays: currentDate.getDate(),
      eWeekDay: currentDate.getDay(),
      eMonth: currentDate.getMonth(),
      eYear: currentDate.getFullYear(),
    };
  }
}

@injectable()
export class TaskService extends AbstractService implements ITaskService {
  protected _SERVICE_NAME = TaskService.name;
  private _SCHEDULER: ITaskScheduler | undefined;
  private _config: NTaskService.Config;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService
  ) {
    super();

    this._config = {
      enable: false,
      maxTask: "no-validate",
      periodicity: 1000,
      workers: {
        minWorkers: "max",
        maxWorkers: 1,
        maxQueueSize: undefined,
        workerType: "auto",
        workerTerminateTimeout: 1000,
      },
    };
  }

  private _setConfig(): NTaskService.Config {
    return {
      enable: this._discoveryService.getBoolean(
        "services.scheduler.enable",
        this._config.enable
      ),
      maxTask: this._discoveryService.getOptional<
        number | "no-validate" | undefined
      >("services.scheduler.maxTask", this._config.maxTask),
      periodicity: this._discoveryService.getNumber(
        "services.scheduler.periodicity",
        this._config.periodicity
      ),
      workers: {
        minWorkers: this._discoveryService.getOptional<
          number | "max" | undefined
        >(
          "services.scheduler.workers.minWorkers",
          this._config.workers.minWorkers
        ),
        maxWorkers: this._discoveryService.getOptional<number | undefined>(
          "services.scheduler.workers.maxWorkers",
          this._config.workers.maxWorkers
        ),
        maxQueueSize: this._discoveryService.getOptional<number | undefined>(
          "services.scheduler.workers.maxQueueSize",
          this._config.workers.maxQueueSize
        ),
        workerType: this._discoveryService.getOptional<
          "auto" | "web" | "process" | "thread" | undefined
        >(
          "services.scheduler.workers.workerType",
          this._config.workers.workerType
        ),
        workerTerminateTimeout: this._discoveryService.getOptional<
          number | undefined
        >(
          "services.scheduler.workers.workerTerminateTimeout",
          this._config.workers.workerTerminateTimeout
        ),
      },
    };
  }

  public async init(): Promise<boolean> {
    this._config = this._setConfig();

    if (!this._config.enable) return false;

    try {
      this._SCHEDULER = new TaskScheduler<string, NTaskScheduler.Task>({
        workers: this._config.workers,
        periodicity: this._config.periodicity,
      });

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  public async destroy(): Promise<void> {
    if (this._SCHEDULER) {
      this._SCHEDULER.destroy();
      this._SCHEDULER = undefined;
    }
  }

  private get _scheduler(): ITaskScheduler {
    if (!this._SCHEDULER) {
      throw new Error("Task Scheduler not initialize.");
    }
    return this._SCHEDULER;
  }

  public on<K>(
    event: "first",
    listener: (key: K, val: NTaskScheduler.TimePayload) => void
  ): void;
  public on<K>(
    event: "next",
    listener: (key: K, val: NTaskScheduler.TimePayload) => void
  ): void;
  public on<K, T = unknown>(
    event: "success",
    listener: (key: K, val: NTaskScheduler.OnSuccess<T>) => void
  ): void;
  public on<K, T = unknown>(
    event: "error",
    listener: (key: K, val: NTaskScheduler.OnError<T>) => void
  ): void;
  public on<K>(event: "delete", listener: (key: K) => void): void;
  public on(event: string | symbol, listener: (...args: any[]) => void): void {
    this._scheduler.on(event, listener);
  }

  public once(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): void {
    this._scheduler.once(event, listener);
  }

  public removeListener(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): void {
    this._scheduler.removeListener(event, listener);
  }

  public set<K extends string>(
    key: K,
    value: NTaskScheduler.Task
  ): ITaskScheduler {
    return this._scheduler.set(key, value);
  }

  public get<K extends string>(key: K): NTaskScheduler.Task | undefined {
    return this._scheduler.get(key);
  }

  public delete<K extends string>(key: K): boolean {
    return this._scheduler.delete(key);
  }
}
