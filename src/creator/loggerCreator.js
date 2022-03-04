const { createLogger, format, transports } = require("winston");

function _createLogger(botName){
  let logger = createLogger({
    level: "info",
    format: format.combine(
      format.timestamp({
        format: "DD.MM.YYYY HH:mm:ss",
      }),
      format.errors({
        stack: true,
      }),
      format.splat(),
      format.json()
    ),
    defaultMeta: {
      service: botName,
    },
    transports: [
      new transports.File({
        filename: "./logs/" + botName + "/error.log",
        level: "error",
      }),
      new transports.File({
        filename: "./logs/" + botName + "/combined.log",
      }),
    ],
  });
  
  //
  // If we're not in production then **ALSO** log to the `console`
  // with the colorized simple format.
  //
  if (process.env.NODE_ENV === "development") {
    logger.add(
      new transports.Console({
        format: format.combine(format.colorize(), format.simple()),
      })
    );
  }

  return logger;
}

module.exports = {createLogger: _createLogger};
