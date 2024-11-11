type LogMessage = string | Error | object;
type LogOptionalParams = string | object;

export interface Logger {
  log: (message: LogMessage, ...optionalParams: LogOptionalParams[]) => void;
  debug: (message: LogMessage, ...optionalParams: LogOptionalParams[]) => void; 
  info: (message: LogMessage, ...optionalParams: LogOptionalParams[]) => void;
  warn: (message: LogMessage, ...optionalParams: LogOptionalParams[]) => void;
  error: (message: LogMessage, ...optionalParams: LogOptionalParams[]) => void;
}

export const consoleLogger: Logger = {
  log: function (message: LogMessage, ...optionalParams: LogOptionalParams[]): void {
    console.log(message, optionalParams);
  },
  debug: function (message: LogMessage, ...optionalParams: LogOptionalParams[]): void {
    console.log(message, optionalParams);
  },
  info: function (message: LogMessage, ...optionalParams: LogOptionalParams[]): void {
    console.log(message, optionalParams);
  },
  warn: function (message: LogMessage, ...optionalParams: LogOptionalParams[]): void {
    console.warn(message, optionalParams);
  },
  error: function (message: LogMessage, ...optionalParams: LogOptionalParams[]): void {
    console.error(message, optionalParams);
  },
}