export default {
  /**
   * [ExceptionLogType]
   * @terminal - logs will be displayed at the console,
   *  this will be disabled on production state.
   * @database - logs will be saved on the configured
   *  DB connection.
   * @http - Logs will be sent through
   * a http call
   * @textfile - logs will be saved on a textfile
   */
  LogType: {
    type: "terminal",
    params: {
      /**
       * specify the database
       * LogSystem will connect to.
       */
      database: {
        connection: checkout(process.env.database, "dev"),
      },
      /***
       * [url&method] must be
       * declared before [http]
       * can be set as default logger
       */
      http: {
        url: "",
        method: "",
      },
      /***
       * path to file
       * where the logs will
       * be written
       */
      textfile: {
        path: "",
      },
    },
  },

  /**
   * [Exception Registry]
   * you can create your own Exception
   * via cli [chasi create exception {ExceptionName}]
   * **** please register exception as .js file
   */
  registry: {
    ChasiException:
      "./package/framework/ErrorHandler/exceptions/ChasiException.js",
    APIException: "./package/framework/ErrorHandler/exceptions/APIException.js",
  },

  /**
   * [Default Responses]
   * when return message is not configured
   * on the exception, this default
   * will fill in the client Responses.
   */
  responses: {
    302: "sos ",
    401: "we can't verify your token! ",
    404: "Oops, we can't find what you're looking for.",
    500: "Oops, we can't find what you're looking for.",
    default: "ServerError, please try again later!",
  },
};
