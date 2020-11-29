import { configure, getLogger } from "log4js";

const LOG_PATH = "./logs";

configure({
  appenders: {
    access: {
      type: "dateFile",
      filename: `${LOG_PATH}/access.log`,
      pattern: "-yyyy-MM-dd",
      backups: 3,
    },
    debug: {
      type: "dateFile",
      filename: `${LOG_PATH}/debug.log`,
      pattern: "-yyyy-MM-dd",
      backups: 3,
    },
  },
  categories: {
    default: { appenders: ["access"], level: "ALL" },
    access: { appenders: ["access"], level: "DEBUG" },
    debug: { appenders: ["debug"], level: "DEBUG" },
  },
});
export const logger = getLogger();
