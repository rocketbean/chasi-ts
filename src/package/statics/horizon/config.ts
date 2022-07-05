export default {
  observer: {
    events: {
      __before__: "package/statics/horizon/events/BeforeApp",
      __after__: "package/statics/horizon/events/AfterApp",
      __initialize__: "package/statics/horizon/events/InitializeApp",
      __boot__: "package/statics/horizon/events/BootApp",
    },
  },
};
