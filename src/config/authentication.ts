export default {
  drivers: {
    dev: {
      /**
       * Authentication Driver
       */
      driver: "jwt",
      /**
       ***************** [FILE HANDLER] ********************
       * you can use your own  Auth Handler by specifying
       * a filepath. Must impliment [AuthDriver]interface
       * if the value is null,  Chasi instance will use
       * the default Handler Chasi provides
       *****************************************************
       */
      handler: null,
      /**
       * * * * * * * * * * NOTE * * * * * * * * * * *
       * Key to use in encryption
       * it is recommended to have this
       * value stored in the machine's environment
       * variables list.
       */
      key: checkout(process.env.oauthkey, "chasi-dev")
,
      /**
       * Chasi will automatically attach
       * the authenticated data
       * to the request parameter
       * as {Request[auth]} via this model/schema.
       */
      model: "user",
      /**
       * if there's an instance where
       * you will have route/s that needs to
       * be excempted from Authentication Guards
       * you can register those endpoint here.
       * and please note that unauthorized guard
       * will not be able to access params like
       * [request.auth], e.g. on logins and sign ups
       */
      AuthRouteExceptions: [],
    },
  },
};
