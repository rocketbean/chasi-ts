export type task = {
  id: string,
  value: string,
  raw: string,
  position: strPos
}

export type strPos = {
  start: string,
  startIndex: number,
  end: string
  endIndex: number,
}

export default class StreamBucket {

  public _bucket: { value: string } = { value: "" }
  public overflow: string = ""
  public _readystate: boolean = true
  public bucketProxy = new Proxy(this._bucket, {
    get: (o, key) => {
      return Reflect.get(o, key);
    },
    set: (o, key, value) => {
      if (this.readystate) {
        Reflect.set(o, key, value);
        this.mapBucketString(Reflect.get(o, key));
      } else this.overflow += value
      return true
    }
  })

  public stack: task[] = []
  public data;


  public prop = {
    delim: {
      start: "<=====|",
      end: "|=====>"
    }
  }
  constructor(private worker, private cb: Function) { }

  get bucket() { return this.bucketProxy }
  set bucket(v) { this.bucketProxy = v }
  get readystate() { return this._readystate }
  async mapBucketString(str) {
    this._readystate = false;
    this.splitWithIndex(str).map(res => {
      let nstr = str.slice(res.startIndex, res.endIndex)
      let id = __getRandomStr(5);
      if (nstr.includes(this.prop.delim.start) && nstr.includes(this.prop.delim.end)) {
        let delS = `<${id}|`;
        let delE = `|${id}>`
        nstr = nstr.replace(this.prop.delim.start, delS).replace(this.prop.delim.end, delE);
        this._bucket.value = this._bucket.value.replace(this._bucket.value.slice(res.startIndex, res.endIndex), nstr)
        if (!this.stack.find(v => v.id == id)) {
          this.stack.push({
            id,
            value: nstr.replace(delS, "").replace(delE, "").trim(),
            raw: nstr,
            position: {
              start: delS,
              startIndex: res.startIndex,
              end: delE,
              endIndex: res.endIndex,

            }
          })
        }
      }
    })
    await this.runTasks()
    this.checkOverFlow()
    this._readystate = true;
  }

  checkOverFlow() {
    if (this.overflow.length >= 1) {
      Logger.log("overflown....")
      this.appendStreamData(this.overflow)
      this.overflow = ""
    }
  }

  async runTasks() {
    await Promise.all(
      this.stack.map(async (task, index) => {
        await this.cb(this.worker, task.value)
        this._bucket.value = this._bucket.value.replace(task.raw, "")
        this.stack.splice(index, 1)
      })
    )
  }

  appendStreamData(streamdata: string) {
    this.bucket.value += streamdata;
  }

  splitWithIndex(str) {
    let regx = /\<=====\|([^)]+?)\|=====\>/gm;
    let res = [...str.matchAll(regx)];
    return res.map(r => {
      return {
        startIndex: r.index,
        endIndex: r.index + r[0].length,
        raw: r[0],
        value: r[1]
      }
    })
  }

}