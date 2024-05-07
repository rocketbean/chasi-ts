<template>
  <div class="letterize">
    <div class="animate-me">
      ***************************************************************************
    </div>
    <div class="animate-me">
      ***************************************************************************
    </div>
    <div class="animate-me">
      ***************************************************************************
    </div>
    <div class="animate-me">
      ***************************************************************************
    </div>
    <div class="animate-me">
      ***************************************************************************
    </div>
    <div class="animate-me">
      ***************************************************************************
    </div>
    <div class="animate-me">
      ***************************************************************************
    </div>
    <div class="animate-me">
      ***************************************************************************
    </div>
    <div class="animate-me">
      ***************************************************************************
    </div>
    <div class="animate-me">
      ***************************************************************************
    </div>
    <div class="animate-me">
      ***************************************************************************
    </div>
    <div class="animate-me">
      ***************************************************************************
    </div>
    <div class="animate-me">
      ***************************************************************************
    </div>
    <div class="animate-me">
      ***************************************************************************
    </div>
    <div class="animate-me">
      ***************************************************************************
    </div>

    <div class="animate-me">
      ***************************************************************************
    </div>

    <div class="animate-me">
      ***************************************************************************
    </div>

  </div>
</template>

<script>
import anime from 'animejs';
import Letterize from "@/assets/letterize.js"

export default {
  mounted() {
    const test = new Letterize({
      targets: ".animate-me"
    });
    const animation = anime.timeline({
      targets: test.listAll,
      delay: anime.stagger(20, {
        grid: [test.list[0].length, test.list.length],
        from: "center"
      }),
      loop: true,
      autoplay: true
    });

    animation
      .add({
        scale: 0.7
      })
      .add({
        letterSpacing: "12px"
      })
      .add({
        scale: 1
      })
      .add({
        letterSpacing: "8px"
      });
  }
}
</script>

<style>
.letterize {
  position: absolute;
  color: #ffffff;
  font-weight: 1200;
  font-size: 20px;
  text-transform: uppercase;
  font-family: "Khula", sans-serif;
  letter-spacing: 8px;
  line-height: 1.2;
  margin: 0;
  overflow: hidden;
  width: 100vw;
  z-index: -1;
  top: 0;
  left: 0;
}

.animate-me {}

span {
  display: inline-block;
}
</style>