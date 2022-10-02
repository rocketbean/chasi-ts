import path from "path";

export default {
  name: "model",
  defaultPath: "./src/container/models",
  options: {
    params: { type: "", schema: "", name: "" },
  },
  pre: function (filename) {
    let _m = {};
    let fn = filename.split("/").pop();
    _m["name"] = fn.capitalize();
    _m["ext"] = ".ts";
    _m["path"] = path.join(this.defaultPath, _m["name"] + _m["ext"]);
    _m["type"] = fn.capitalize() + "Model";
    _m["schema"] = fn.capitalize() + "Schema";
    _m["service"] = this.name;

    return Object.assign(this.options.params, _m);
  },
  process: function (filename) {
    this.params = this.pre(filename);
    return {
      params: this.params,
      template: this.template(this.params),
    };
  },
  template: (model) => {
    return `import Model from "../../package/statics/Model.js";
import mongoose from "mongoose";

export type ${model["type"]} = {
  _: string;
};

var ${model["schema"]} = new mongoose.Schema<${model["type"]}>({
  _: {
    type: String,
    required: true,
    trim: true,
  },
});

const ${model["name"].toUpperCase()} = Model.connect("${model["name"]}", ${
      model["schema"]
    });
export default ${model["name"].toUpperCase()};
`;
  },
};
