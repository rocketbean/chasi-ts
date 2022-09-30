<template>
  <div class="flux-container">
      <div class = "containStart flex-center" >
        <ideal style = "display:flex; justify-content: center; align-items: center; " :document = "document"/>
      </div>
      <div class = "flex-center" style = "width:100%; height:100%; display:flex; justify-content: center; align-items:center" >
        <div class = "content-box" :class="document_cb_class" :style = "document_cb" >
          <div class = "content-pad" >
            <section>
              <h1 class="title">Chasi-TS </h1>
              <h2 class="subtitle">Build Something Awesome!</h2>
              <div style = "border-top: 1px solid grey">
                <logs-sm v-if = "document"></logs-sm>
                <logs-wide v-else></logs-wide>
              </div>
            </section>
            <div class = "auto-grid-sm grid-gap-sm">
              <button :class = "document_buttons" class="button is-outlined is-fullwidth" @click = "document = !document">Docs</button>
              <a href = "https://github.com/rocketbean/chasi-ts" target="_new">
                <button :class = "document_buttons" class="button is-outlined is-fullwidth">Github</button>
              </a>
            </div>
            </div>
        </div>
      </div>
  </div>
</template>
<script>
export default {
  computed: {
    document_cb () {
      if(!this.document) return "width:60%;  "
      else return ""
    },
    document_contain () {
      if(!this.document) return "width:100%; height:100%; right: 0; "
      else return ""
    },
    document_cb_class () {
      if(!this.document) return "bg-dark shadow-2 text-content-light"
      else return "bg-light shadow-1 text-content-dark"
    },
    document_buttons () {
      if(!this.document) return "is-light"
      else return "is-dark"
    }
  },
  data() {
    return {
      document: true,
    }
  },
  mounted () {
    console.log("test")
  }
}
</script>

<style >
* {
    margin:0px;
    padding:0px;
    text-rendering: optimizeLegibility;
    -webkit-transition: all 200ms cubic-bezier(0.34, 0.18, 0.23, 0.76);
    transition: all 200ms cubic-bezier(0.34, 0.18, 0.23, 0.76);
  }

  .bg-dark {
    background: #444;
  }

  .bg-light {
    background: #fff;
  }

  .text-content-light section > * {
    color: #fff !important;
  }

  .text-content-dark section > * {
    color: #888 !important;
  }



  .flux-container {
    position:relative;
    z-index: 1;
    width:100vw;
    height: 100vh;
    background: rgb(217,217,217);
    background: linear-gradient(36deg, rgb(171, 169, 169) 0%, rgba(245,245,245,1) 46%, rgba(255,255,255,1) 100%) !important;
  }

  .content-box:hover {
    transform: none
  }
  .content-box {
    transform: rotateX(2deg)
      rotateY(2deg)
      perspective(1300px)
      scale(0.98)
      skew(3deg,0deg);
      transform-origin: 33% center;
      box-shadow: -4px 8px 7px -2px rgba(64,64,64,0.59);
      -webkit-box-shadow: -4px 8px 7px -2px rgba(64,64,64,0.59);
      -moz-box-shadow: -4px 8px 7px -2px rgba(64,64,64,0.59);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    padding: 4px;
    width: 350px;
    border-radius: 4px;
    text-align: center;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }
  .content-box > .content-pad:hover {
    border:none;
  } 
  .content-box > .content-pad {
    border-radius: 4px;
    padding: 15px;
  }

  .content-pad > .title, .content-pad > .subtitle {
    color: grey;
  }


  .containStart {
    position:absolute;
    z-index: -1 !important;
    background: transparent;
    width:100%;
    height:100%;
    left:0;
    top: 0;
  }

  .auto-grid-sm {
    display:grid;
    grid-template-columns: repeat(auto-fit, minmax(50px, 1fr)); 
  }

  .grid-gap-sm {
    grid-gap:0.5em; 
  }

  .shadow-1 {
    box-shadow: -4px 8px 12px 3px rgba(64,64,64,0.59);
    -webkit-box-shadow: -4px 8px 12px 3px rgba(64,64,64,0.59);
    -moz-box-shadow: -4px 8px 12px 3px rgba(64,64,64,0.59);
  }

  .shadow-2 {
      box-shadow: -4px 8px 7px -2px rgba(64,64,64,0.59);
      -webkit-box-shadow: -4px 8px 7px -2px rgba(64,64,64,0.59);
      -moz-box-shadow: -4px 8px 7px -2px rgba(64,64,64,0.59);
  }
</style>