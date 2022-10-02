import _Controller from "./_Controller.js";
import _Model from "./_Model.js";
import _Event from "./_Event.js";
import _Middleware from "./_Middleware.js";
import _Router from "./_Router.js";
import path from "path";
import fs from "fs";

export default async (filename, args) => {
  let generates = [];
  if (args?.controller) generates.push(_Controller.process(filename, args));
  if (args?.model) generates.push(_Model.process(filename, args));
  if (args?.event) generates.push(_Event.process(filename, args));
  if (args?.middleware) generates.push(_Middleware.process(filename, args));
  if (args?.router) generates.push(_Router.process(filename, args));

  await Promise.all(
    generates.map(async (template) => {
      try {
        let dirpath = path.join(process.cwd(), template.params.path);
        fs.writeFile(
          dirpath,
          template.template,
          { flag: "wx" },
          function (err) {
            if (err)
              console.error(
                `it seems that you already have ${template.params.service} ${template.params.name} file`,
              );
            else {
              console.log(
                `generated ${template.params.service}::${template.params.name}`,
              );
            }
          },
        );
      } catch (e) {
        console.log(e);
      }
    }),
  );
};
