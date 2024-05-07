import { defineStore } from "pinia";
import control from "../data/control";
import _ from "lodash"

export const useControlStore = defineStore( "ControlStore", {
  state: () => {
    return {
      left: {
        navigation: control.collection
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
      return control.dictionary;
    },
    collection () {
      return Object.keys(control.dictionary).map(subject => control.dictionary[subject]);
    },
    searchRows () {
      return this.search.rows
    }
  },
  actions: {
    setRows (arr) {
      this.search.rows = arr
    },
    setModal (val) {
      this.searchModal.open = val 
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
      }).filter(subject => subject.reference.includes(group))
    },
    activate(id) {
      let ctx = Object.values(control.collection).find(cont => cont.id === id) ||
        Object.values(control.collection).find(cont => cont.id === control.default)
      if(ctx?.controls?.header) this.setHeaderControls(ctx.controls.header)
      if(ctx?.controls?.right) this.setRightControls(ctx.controls.right)
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