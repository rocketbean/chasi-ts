export default {
  observer: {
    events: {
      __before__: "package/statics/horizon/events/BeforeApp",
      __after__: "package/statics/horizon/events/AfterApp",
      __initialize__: "package/statics/horizon/events/InitializeApp",
      __exception__: "package/statics/horizon/events/Exception",
      __boot__: "package/statics/horizon/events/BootApp",
      __ready__: "package/statics/horizon/events/ReadyApp",
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
    hooks: {
      beforeApp(getConfig) {
        console.log("msmsmsm");
      },
    },
  },

  exceptions: {
    events: ["__exception__"],
  },
};
