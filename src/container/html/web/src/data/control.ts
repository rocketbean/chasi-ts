import v350 from "./versions/v3.5.0.json"
import v300 from "./versions/v3.0.0.json"

type PanelControl = {
  right?: { open?: boolean },
  header?: { subheader?: { open?: boolean } }
}

type glossary = {
  id: string,
  label: string,
  sublabel?: string[] | string,
  keywords?: string[],
  reference?: string[],
  loc?: string,
  type?: string,
  text?: string,
  textmap?: any,
}

type requirement = {
  id: string,
  label: string,
  value: string,
  keywords?: string[],
  text?: string,
}

type subject = {
  id: string,
  label: string,
  text?: string,
  display?: boolean,
  keywords?: string[],
  glossary?: glossary[],
  requirements?: requirement[],
  controls?: PanelControl,
  type?: string
}

export const versions: Record<string, { version: string; sections: subject[] }> = {
  "3.5.0": v350 as any,
  "3.0.0": v300 as any,
}

export const defaultVersion = "3.5.0"

export function buildData(versionKey: string) {
  const versionData = versions[versionKey] ?? versions[defaultVersion]
  const result = {
    collection: {} as Record<string, subject>,
    dictionary: {} as Record<string, glossary>,
    default: "intro",
    version: versionData.version,
  }

  const addGlossary = (glossary: glossary[], reference = '') => {
    glossary.forEach(def => {
      const prop: any = { ...def }
      if (!prop?.reference) prop.reference = []
      if (reference) {
        prop.loc = `${reference}@${def.id}`
        prop.reference.push(reference)
      }
      result.dictionary[def.id] = { ...prop }
    })
  }

  versionData.sections.forEach((item: subject) => {
    if (item?.display) {
      result.collection[item.label] = { ...item }
    }
    if (item?.glossary) addGlossary(item.glossary, item?.id)
    if (item?.requirements) {
      item.requirements.forEach(req => {
        result.dictionary[req.id] = {
          ...req,
          reference: [item.id],
          loc: `${item.id}@${req.id}`,
          keywords: req.keywords ?? [req.label.toLowerCase(), 'requirements', 'version'],
          text: req.text ?? `Minimum required version: ${req.value}`,
        }
      })
    }
  })

  return result
}

export default buildData(defaultVersion)
