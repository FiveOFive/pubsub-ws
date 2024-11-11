interface LogFunction {
  (message: string): void;
  (obj: object, message?: string): void;
}

export interface Logger {
  debug: LogFunction;
  info: LogFunction;
  warn: LogFunction;
  error: LogFunction;
}

export const consoleLogger: Logger = {
  debug: (objOrMsg: object | string, message?: string) => {
    if (typeof objOrMsg === 'string') {
      console.log(message);
    } else {
      console.log(objOrMsg, message);
    }
  },
  info: (objOrMsg: object | string, message?: string) => {
    if (typeof objOrMsg === 'string') {
      console.log(message);
    } else {
      console.log(objOrMsg, message);
    }
  },
  warn: (objOrMsg: object | string, message?: string) => {
    if (typeof objOrMsg === 'string') {
      console.warn(message);
    } else {
      console.warn(objOrMsg, message);
    }
  },
  error: (objOrMsg: object | string, message?: string) => {
    if (typeof objOrMsg === 'string') {
      console.error(message);
    } else {
      console.error(objOrMsg, message);
    }
  },
}