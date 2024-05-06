import "reflect-metadata";
import { inversify } from "~packages";

const mode = process.env.CAP_SERVER_MODE ?? "default";
const modulePath = `./core.${mode}.ioc.module`;

const { CoreModule } = require(modulePath);

const container = new inversify.Container();
container.load(CoreModule);

export { container };
