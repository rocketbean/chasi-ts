import path from "path";

export default {
  name: "event",
  defaultPath: "./src/container/events",
  options: {
    params: { name: "" },
  },
  pre: function (filename) {
    let _e = {};
    let fn = filename.split("/").pop();
    _e["name"] = fn.capitalize() + "Event";
    _e["ext"] = ".ts";
    _e["path"] = path.join(this.defaultPath, _e["name"] + _e["ext"]);
    _e["service"] = this.name;
    return Object.assign(this.options.params, _e);
  },
  process: function (filename, args) {
    this.params = this.pre(filename);
    return {
      params: this.params,
      template: this.template(this.params),
    };
  },
  template: (event) => {
    return `import Event, { EventInterface } from "../../package/Observer/Event.js";

    export default class ${event["name"]} extends Event implements EventInterface {
      /**
       *
       * @param {params} recieves the Event parameters
       * declared when the event is emitted
       * @param {next} [DO NOT FORGET TO CALL]
       * next when validated
       */
      async validate(params, next) {
        next();
      }
    
      /**
       * called when the event  is emitted
       * all through out the Chasi Instance
       * @param {params}
       * contains the property that have
       * been passed on emit.
       */
      async fire(params) {}
    }
`;
  },
};
