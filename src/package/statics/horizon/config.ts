export default {
  observer: {
    events: {
      __before__: "package/statics/horizon/events/BeforeApp",
      __after__: "package/statics/horizon/events/AfterApp",
      __initialize__: "package/statics/horizon/events/InitializeApp",
      __exception__: "package/statics/horizon/events/exception",
      __boot__: "package/statics/horizon/events/BootApp",
    },
  },

  authentication: {
    defaultJWTDriverPAth: "package/framework/Server/AuthDrivers/jwt.js",
  },

  server: {
    serviceCluster: {
      serverFile: "package/framework/Chasi/storage/session.chasi",
      clusterFile: "package/framework/Chasi/storage/cluster.chasi",
    },
  },

  exceptions: {
    events: ["__exception__"],
  },
};
