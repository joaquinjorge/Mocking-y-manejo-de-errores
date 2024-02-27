const winston = require("winston");
const configDotenv = require("../config/config");

const loggerPersonalizado = winston.createLogger({
  levels: { debug: 5, http: 4, info: 3, warning: 2, error: 1, fatal: 0 },
  transports: [],
});

const archivoLogger = new winston.transports.File({
  level: "error",
  filename: "./logs/error.log",
  format: winston.format.json(),
});

const loggerPersonalizadoDev = new winston.transports.Console({
  level: "debug",
  format: winston.format.combine(
    winston.format.colorize({
      colors: {
        debug: "blue",
        http: "cyan",
        info: "green",
        warning: "yellow",
        error: "magenta",
        fatal: "red",
      },
    }),
    winston.format.simple()
  ),
});

const loggerPersonalizadoProd = new winston.transports.Console({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize({
      colors: {
        debug: "blue",
        http: "cyan",
        info: "green",
        warning: "yellow",
        error: "magenta",
        fatal: "red",
      },
    }),
    winston.format.simple()
  ),
});

if (configDotenv.MODE == "dev") {
  loggerPersonalizado.add(loggerPersonalizadoDev);
}

if (configDotenv.MODE == "prod") {
  loggerPersonalizado.add(loggerPersonalizadoProd);
  loggerPersonalizado.add(archivoLogger);
}
const middLog = (req, res, next) => {
  req.logger = loggerPersonalizado;
  next();
};
module.exports = middLog;
