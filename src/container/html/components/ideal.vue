<template >
    <div ref = "canvas" class = "flux-bg" style = "height:100%; " ></div>
</template>
<script>
import * as THREE from 'three'

export default {
  name: "ideal",
  props: ['document'],
  watch: {
    document(val) {
    }
  },
  methods: {
    properties () {
      let prop;
      if(!this.prop?.fc) {
        prop = this.init()
        this.prop = prop
      }
      return prop
    },
    init () {
      var fc = 0,
      effectStacks= [],
      effects = {
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
      animations = {
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
            x: 0.000025,
            y: 0.000025 
          }, 
        }
      };
      let objects = []
      let scene = new THREE.Scene()
      let camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.9,
        100
      )
      let renderer = new THREE.WebGLRenderer({ antialias: true })
      let light = new THREE.DirectionalLight('hsl(30, 100%, 100%)')
      renderer.setSize(window.innerWidth, window.innerHeight)
      this.$refs.canvas.appendChild(renderer.domElement)
      const geometry =  new THREE.TorusKnotGeometry( 14.184, 5.3066, 160, 4, 2,3 );
      const points = new THREE.PointsMaterial({ color: 0x888888, size: 0.15 })
      let obj = new THREE.Points(geometry, points)
      const wireframe = new THREE.WireframeGeometry( geometry );
      let obj2 = new THREE.LineSegments( wireframe );
      obj2.material.depthTest = false;
      obj2.material.opacity = 0.11;
      obj2.material.transparent = true;
      obj2.material.color = 0x555555
      this.addObject(scene, obj, objects)
      this.addObject(scene, obj2, objects)
      scene.add(light)
      camera.position.z = 15;
      camera.position.x = 20;
      light.position.set(0, 10, 10)
      renderer.setClearColor(0xffffff, 0);
      return {
        scene,
        fc,
        camera,
        renderer,
        objects,
        animations,
        light,
        effectStacks,
        effects
      }
    },
    addObject (scene, obj, objects) {
      scene.add(obj)
      objects.push(obj)
    },
    addEffect (prop, effect) {
      let startFrame = prop.frameCount;
      prop.effectStacks.push({
        startFrame,
        effect: {...effect}
      })
    },
    animateEffect(prop) {
      prop.effectStacks.forEach ((a, i) => {
        if(a.effect.state < 1) {
          this.applyEffect(a.effect);
        }
        let dur = a.startFrame + a.effect.prop.duration;
        if(prop.frameCount >= dur) {
          a.effect.stop()
          prop.effectStacks.splice(i, 1)
        };
      })
    },
    applyEffect(prop, effect) {
      let that = this;
      effect.state = 1;
      effect.prop.origin = effect.prop.target.reduce((a,b) => a[b], prop);
      effect.prop.target.reduce((a,b) => {
        if(typeof a[b] !== "object") {
          effect.prop.targetProp = a;
          effect.prop.targetObj = b;
          a[b] += effect.prop.value
        }
        return a[b]
      }, that)
    },
    animate (prop) {
      const animateFrame = () => {
        prop.fc += 1;
        this.animateEffect(prop);
        prop.objects.forEach(obj => {
          obj.rotation.x -= prop.animations.objects.rotation.x
          obj.rotation.y -= prop.animations.objects.rotation.y
        })
        let target = prop.objects[0];
        prop.camera.position.y =  Math.sin( 250+  prop.animations.delta) * 15 ; 
        prop.camera.position.x = Math.sin(250+ prop.animations.delta) * 15; 
        prop.camera.position.z = Math.cos(prop.animations.delta) * 15;
        prop.camera.lookAt( target.position );
        prop.animations.delta += prop.animations.deltaSpeed;
        prop.renderer.render(prop.scene, prop.camera)
        requestAnimationFrame(animateFrame)
      }
      animateFrame()
    }
  },
  mounted () {
    this.animate (this.properties())
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
