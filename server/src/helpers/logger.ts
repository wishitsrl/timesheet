import logger from "pino";
import path from "path";
import { format } from "date-fns";
import httpContext from "express-http-context";

const logFilePath = path.resolve(__dirname, "../logs");

const defaultOpts = {
  singleLine: true,
  mkdir: true,
  hideObject: false,
  ignore: "hostname",
  prettyPrint: true,
};

const targets = [
  {
    level: "info",
    target: "pino/file",
    options: {
      ...defaultOpts,
      destination: path.resolve(logFilePath, "info.log"),
    },
  },
  {
    level: "debug",
    target: "pino/file",
    options: {
      ...defaultOpts,
      destination: path.resolve(logFilePath, "debug.log"),
    },
  },
  {
    level: "error",
    target: "pino/file",
    options: {
      ...defaultOpts,
      destination: path.resolve(logFilePath, "error.log"),
    },
  },
];

if (process.env.ENABLE_CONSOLE_LOG === "true") {
  targets.push({
    level: "debug",
    target: "pino-pretty",
    options: {
      ignore: "pid,hostname",
      singleLine: true,
    },
  } as any);
}

const transport = logger.transport({
  targets,
});

const logInstance = logger(
  {
    level: process.env.PINO_LOG_LEVEL || "info",
    timestamp: () => `,"time":"${format(Date.now(), "dd-MMM-yyyy HH:mm:ss sss")}"`,
    mixin() {
      const reqId = httpContext.get("req_id") as string;
      return reqId ? { req_id: reqId } : {};
    },
  },
  transport
);

export default logInstance;
