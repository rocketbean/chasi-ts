import { defineStore } from "pinia";
import { buildData, versions, defaultVersion } from "../data/control";
import _ from "lodash"

export const useControlStore = defineStore( "ControlStore", {
  state: () => {
    const _data = buildData(defaultVersion)
    return {
      _data,
      activeVersion: defaultVersion,
      availableVersions: Object.keys(versions).sort((a, b) => b.localeCompare(a, undefined, { numeric: true })),
      left: {
        navigation: _data.collection
      },
      right: {
        controls: {
          open: true
        }
      },
      main: {
      },
      header: {
        controls: {
          subheader: {
            open: true
          }
        }
      },
      search: {
        controls: {
          open: false,
        },
        rows: [],
        key: ''
      },
      about: {
        controls: {
          open: false,
        }
      },
      active: {
        context: {
        },
        viewport: {
          target: {
            id: ""
          }
        }
      }
    }
  },
  getters: {
    view () {
      return this.active
    },
    searchModal() {
      return this.search.controls;
    },
    aboutModal () {
      return this.about.controls
    },
    headerControls() {
      return this.header.controls;
    },
    rightControls() {
      return this.right.controls;
    },
    ctx () {
      return this.active.context
    },
    scr () {
      return this.active.viewport
    },
    dict () {
      return this._data.dictionary;
    },
    collection () {
      return Object.keys(this._data.dictionary).map(subject => this._data.dictionary[subject]);
    },
    searchRows () {
      return this.search.rows
    },
    requirements () {
      const intro = Object.values(this._data.collection).find(s => s.id === 'intro')
      return intro?.requirements ?? []
    },
  },
  actions: {
    switchVersion(version) {
      if (!versions[version] || version === this.activeVersion) return
      this.activeVersion = version
      this._data = buildData(version)
      this.left.navigation = this._data.collection
      this.activate(this._data.default)
    },
    setRows (arr) {
      this.search.rows = arr
    },
    setModal (val) {
      this.searchModal.open = val
    },
    setAboutModal (val) {
      this.aboutModal.open = val
    },
    toggleModal () {
      this.searchModal.open = !this.searchModal.open
    },
    setViewPort(target) {
      this.active.viewport.target = target;
    },
    ref (group) {
      return Object.keys(this.dict).map(subject => {
        return this.dict[subject]
      }).filter(subject => subject.reference && subject.reference.includes(group))
    },
    activate(id) {
      let ctx = Object.values(this._data.collection).find(cont => cont.id === id) ||
        Object.values(this._data.collection).find(cont => cont.id === this._data.default)
      if (!ctx) return
      if(ctx.controls?.header) this.setHeaderControls(ctx.controls.header)
      if(ctx.controls?.right) this.setRightControls(ctx.controls.right)
      this.active.context = this.mapSubCatGroup(ctx)
    },
    mapSubCatGroup (ctx) {
      ctx.subcats = ctx?.subcats?.map(cat => {
        if(cat?.group && cat.group.length > 0 && (typeof cat.group[0] === "string")) {
          cat.group = cat?.group.map( item => {
            let index = ctx.glossary.find(ind => ind.id === item)
            if(index) return {to: index.id, label: index.label};
          })
        }
        return cat;
      })
      return ctx
    },
    setHeaderControls(control) {
      Object.keys(this.header.controls).map(config => {
        this.header.controls[config] = control[config]
      })
    },
    setRightControls(control) {
      Object.keys(this.right.controls).map(config => {
        this.right.controls[config] = control[config]
      })
    }
  }
})
