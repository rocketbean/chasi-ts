export default {
  observer: {
    events: {
      __exception__: "package/statics/horizon/events/exception",
      __before__: "package/statics/horizon/events/BeforeApp",
      __after__: "package/statics/horizon/events/AfterApp",
      __initialize__: "package/statics/horizon/events/InitializeApp",
      __boot__: "package/statics/horizon/events/BootApp",
    },
  },

  authentication: {
    defaultJWTDriverPAth: "package/framework/Server/AuthDrivers/jwt.js",
  },

  exceptions: {
    events: ["__exception__"],
  },
};
