const plugins = import.meta.glob("./plugins/*.js");
const components = import.meta.globEager("./components/*.vue");

export default async (app) => {
  Object.keys(plugins).forEach((plugin) => {
    plugins[plugin](app);
  });

  Object.entries(components).forEach(([path, m]) => {
    let fn = path.split("/");
    let name = fn[fn.length - 1].replace(".vue", "");
    app.component(name, m.default);
  });
};
