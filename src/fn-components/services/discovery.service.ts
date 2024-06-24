import { injectable, inject, AbstractDiscoveryService } from "~packages";
import { CoreSymbols } from "~symbols";

import { AbstractService } from "./abstract.service";

import type {
  Seeds,
  NAbstractService,
  IDiscoveryService,
  NDiscoveryService,
  ILifecycleService,
} from "~types";

@injectable()
export class DiscoveryService
  extends AbstractService
  implements IDiscoveryService
{
  protected readonly _SERVICE_NAME = DiscoveryService.name;
  protected _serverTag: string | undefined;
  private _seedDiscoveryService: Seeds.IAbstractDiscoveryService | undefined;

  protected readonly _discoveryService = this;
  protected readonly _loggerService = undefined;

  constructor(
    @inject(CoreSymbols.LifecycleService)
    protected readonly _lifecycleService: ILifecycleService
  ) {
    super();
  }

  protected async init(): Promise<boolean> {
    this._seedDiscoveryService = new AbstractDiscoveryService();
    this._seedDiscoveryService.setConfigSlice("server");

    try {
      await this._seedDiscoveryService.init();
      this._lifecycleService.emit("DiscoveryService:init");

      return true;
    } catch (e) {
      throw e;
    }
  }

  private get _absDiscoveryService(): Seeds.IAbstractDiscoveryService {
    if (!this._seedDiscoveryService) {
      throw new Error("Abstract discovery service not initialize.");
    }

    return this._seedDiscoveryService;
  }

  public get serverTag(): string {
    return this._absDiscoveryService.serverTag;
  }

  public async reloadConfigurations(): Promise<void> {
    this._emitter.emit(`service:${this._SERVICE_NAME}:reload`);
  }

  public on(
    event: NDiscoveryService.Event,
    listener: NAbstractService.Listener
  ): void {
    this._emitter.on(event, listener);
  }

  public async destroy(): Promise<void> {
    this._seedDiscoveryService = undefined;
    this._serverTag = undefined;
  }

  public get config(): NDiscoveryService.CoreConfig {
    return this._absDiscoveryService.config;
  }

  public getOptional<K, T extends K | undefined = K | undefined>(
    name: NDiscoveryService.KeyBuilder<NDiscoveryService.CoreConfig, T>,
    def: K
  ): K {
    try {
      return this._absDiscoveryService.getMandatory<K>(name);
    } catch {
      return def;
    }
  }

  public getMandatory<T>(name: string): T {
    return this._absDiscoveryService.getMandatory(name);
  }

  public getString(
    name: NDiscoveryService.KeyBuilder<NDiscoveryService.CoreConfig, string>,
    def: string
  ): string {
    return this._absDiscoveryService.getString(name, def);
  }

  public getNumber(
    name: NDiscoveryService.KeyBuilder<NDiscoveryService.CoreConfig, number>,
    def: number
  ): number {
    return this._absDiscoveryService.getNumber(name, def);
  }

  public getBoolean(
    name: NDiscoveryService.KeyBuilder<NDiscoveryService.CoreConfig, boolean>,
    def: boolean
  ): boolean {
    return this._absDiscoveryService.getBoolean(name, def);
  }

  public getArray<T>(name: string, def: Array<T>): Array<T> {
    return this._absDiscoveryService.getArray(name, def);
  }

  public async getCertificateBuffer(
    path: NDiscoveryService.KeyBuilder<NDiscoveryService.CoreConfig, string>
  ): Promise<Buffer> {
    try {
      return await this._absDiscoveryService.getCertificateBuffer(path);
    } catch (e) {
      throw e;
    }
  }

  public async getCertificateString(
    path: NDiscoveryService.KeyBuilder<NDiscoveryService.CoreConfig, string>
  ): Promise<string> {
    try {
      return await this._absDiscoveryService.getCertificateString(path);
    } catch (e) {
      throw e;
    }
  }

  public getSchemaMandatory<T>(name: string): T {
    return this._absDiscoveryService.getMandatory<T>(`schema.${name}`);
  }

  public getSchemaString(name: string, def: string): string {
    return this._absDiscoveryService.getString(`schema.${name}`, def);
  }

  public getSchemaNumber(name: string, def: number): number {
    return this._absDiscoveryService.getNumber(`schema.${name}`, def);
  }

  public getSchemaBoolean(name: string, def: boolean): boolean {
    return this._absDiscoveryService.getBoolean(`schema.${name}`, def);
  }

  public getSchemaArray<T>(name: string, def: Array<T>): Array<T> {
    return this._absDiscoveryService.getArray<T>(`schema.${name}`, def);
  }

  public async getSchemaBuffer(path: string): Promise<Buffer> {
    return this._absDiscoveryService.getCertificateBuffer(`schema.${path}`);
  }
}
