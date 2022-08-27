<template >
    <div ref = "canvas" class = "flux-bg" style = "height:100%; " ></div>
</template>
<script>
import * as THREE from 'three'

export default {
  props: ['document'],
  watch: {
    document(val) {
      console.log(val, "@@ cha")
      this.addEffect(this.effects.camVelocity)
    }
  },
  data () {
    return {
      width: 1,
      height: 1,
      camera: null,
      light: null,
      scene: null,
      renderer: null,
      mesh: null,
      axes: null,
      objects: [],
      frameCount: 0,
      animations: {
        delta: 0,
        deltaSpeed: 0.00001,
        camera: {
          move: {
            x: {
              move: 0,
              limit: 5,
            }
          }
        },
        objects: {
          rotation: {
            x: 0.000015,
            y: 0.000015 
          }, 
        }
      },
      effects: {
        camVelocity: {
          state: 0,
          prop: {
            targetProp: null,
            targetObj: null,
            origin: null,
            duration: 50,
            action: "changeProp",
            target: ["animations", "deltaSpeed"],
            value: 0.01
          },
          stop() {
            this.prop.targetProp[this.prop.targetObj] = this.prop.origin;
          }
        }
      },
      effectStacks: [],
    }
  },
  methods: {
    init () {
      this.scene = new THREE.Scene()
      this.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.9,
        100
      )
      this.renderer = new THREE.WebGLRenderer({ antialias: true })
      this.light = new THREE.DirectionalLight('hsl(30, 100%, 100%)')
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.$refs.canvas.appendChild(this.renderer.domElement)
      const geometry =  new THREE.TorusKnotGeometry( 14.184, 5.3066, 160, 4, 2,3 );
      const points = new THREE.PointsMaterial({ color: 0x888888, size: 0.15 })
      let obj = new THREE.Points(geometry, points)
      const wireframe = new THREE.WireframeGeometry( geometry );
      let obj2 = new THREE.LineSegments( wireframe );
      obj2.material.depthTest = false;
      obj2.material.opacity = 0.11;
      obj2.material.transparent = true;
      obj2.material.color = 0x555555
      this.addObject(obj)
      this.addObject(obj2)
      this.scene.add(this.light)
      this.camera.position.z = 15;
      this.camera.position.x = 20;
      this.light.position.set(0, 10, 10)
      this.renderer.setClearColor(0xffffff, 0);
    },
    addObject (obj) {
      this.scene.add(obj)
      this.objects.push(obj)
    },
    addEffect (effect) {
      let startFrame = this.frameCount;
      this.effectStacks.push({
        startFrame,
        effect: {...effect}
      })
    },
    animateEffect() {
      this.effectStacks.forEach ((a, i) => {
        if(a.effect.state < 1) {
          this.applyEffect(a.effect);
        }
        let dur = a.startFrame + a.effect.prop.duration;
        if(this.frameCount >= dur) {
          a.effect.stop()
          this.effectStacks.splice(i, 1)
        };
      })
    },
    applyEffect(effect) {
      let that = this;
      effect.state = 1;
      effect.prop.origin = effect.prop.target.reduce((a,b) => a[b], this);
      effect.prop.target.reduce((a,b) => {
        if(typeof a[b] !== "object") {
          effect.prop.targetProp = a;
          effect.prop.targetObj = b;
          a[b] += effect.prop.value
        }
        return a[b]
      }, this)
      console.log(effect.prop.targetProp)
    },
    animate () {
      requestAnimationFrame(this.animate)
      this.frameCount += 1;
      this.animateEffect();
      this.objects.forEach(obj => {
        obj.rotation.x -= this.animations.objects.rotation.x
        obj.rotation.y -= this.animations.objects.rotation.y
      })
      let target = this.objects[0];
      this.camera.position.y =  Math.sin( 250+  this.animations.delta) * 15 ; 
      this.camera.position.x = Math.sin(250+ this.animations.delta) * 15; 
      this.camera.position.z = Math.cos(this.animations.delta) * 15;
      this.camera.lookAt( target.position );
      this.animations.delta += this.animations.deltaSpeed;
      this.renderer.render(this.scene, this.camera)
    }
  },
  mounted () {
    this.init()
    this.animate()
  }
}
</script>

<style scoped>
  .flux-bg {
    background: transparent;
    position:relative !important;
    z-index: -1 !important;

  }
  .flux-bg > canvas {
    position:relative !important;
    float:left;
    z-index: -1 !important;
  }
</style>
