const plugins = import.meta.glob("./plugins/*.js");
const components = import.meta.glob("./components/**/*.vue",{ eager: true });
const globalComponents = [
  'codeContainer', 
  'list',
  'inline-separator',
  'tag', 
  'hook', 
  'search',
  'about'
];

export default async (app) => {
  Object.keys(plugins).forEach((plugin) => {
    plugins[plugin](app);
  });

  Object.entries(components).forEach(([path, m]) => {
    let fn = path.split("/");
    let name = fn[fn.length - 1].replace(".vue", "");
    let comp = globalComponents.find(v => v == name);
    if(comp) app.component(name, m.default);
  });
};
