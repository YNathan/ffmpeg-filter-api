import { getLogger } from "log4js";
export let logger;

export function initLogger(category: string, logLevel = "debug"): void {
  logger = getLogger(category);
  logger.level = logLevel;
  const temporaryGlobal: any = global;
  temporaryGlobal.logger = logger;
}
