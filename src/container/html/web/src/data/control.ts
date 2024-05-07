import introduction from "./introduction.json"
import installation from "./installation.json"
import server from "./server.json"
import general from "./general.json"
import router from "./router.json"
import controller from "./controller.json"
import compiler from "./compiler.json"
import observer from "./observer.json"
import database from "./database.json"

type PanelControl = {
  right?: {
    open?: boolean
  },
  header?: {
    subheader?: {
      open?: boolean
    }
  }
}

type subject = {
  id: string,
  label: string,
  text?: string,
  display?: boolean,
  keywords?: string[],
  glossary?: glossary[],
  controls?: PanelControl,
  type?: string
}

type glossary = {
  id: string,
  label: string,
  sublabel?: string[] | string,
  keywords?: string[],
  reference?: string[],
  type?: string,
  text?: string,
  textmap?: any,
}

const data = {
  collection: {},
  dictionary: {},
  default: "intro"
}

const addGlossary = (glossary, reference = '') => {
  glossary.map(def => {
    let prop = {...def};
    if(!prop?.reference) prop.reference = [];
    if(reference) {
      prop.loc = `${reference}@${def.id}`
      prop.reference.push(reference);
    }
    data.dictionary[def.id] = {...prop}

  })
}
const collect = (collection: subject[]) => {
  collection.forEach((item: subject) => {
    if(item?.display) {
      data.collection[item.label] = {...item}
    }
    if(item?.glossary) addGlossary(item.glossary, item?.id)
  })
}


collect([
  introduction.introduction,
  installation.installation,
  server.server,
  router.router,
  controller.controller,
  database.database,
  compiler.compiler,
  observer.observer,
  general.general
]);

export default data;