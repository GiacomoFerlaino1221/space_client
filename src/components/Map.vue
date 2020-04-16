<template>
  <div class="map fadeIn" :class="pageLoad ? 'show' : 'hide'">
    <div class="map-container" ref="map">
      <div class="row" v-for="(row, i) in mapData" :key="i">
        <div class="col" v-for="(col, j) in row" :key="j" @click="activatePositions(col.x, col.y)">
          <div class="wood" v-if="col.obstacle"></div>

          <div
            class="tower"
            v-if="col.tower && see(col)"
            :class="col.owner ? `tower_${col.color}` : ''"
          >{{ col.count }}</div>

          <div class="player selection" v-if="col.x === player.x && col.y === player.y"></div>

          <div
            class="available-points"
            v-if="availablePoints[`${col.x}:${col.y}`] && !col.obstacle"
            @click="moveHere(availablePoints[`${col.x}:${col.y}`])"
          >
            <div class="available-point"></div>
          </div>

          <section v-if="col.owner">
            <div v-if="col.base && see(col)" :class="`base base_${col.color}`">{{ col.count }}</div>
            <div
              class="land"
              :class="[`land_${col.color}`]"
              v-if="!col.tower && col.owner && !col.base && see(col)"
            >
              <span class="land-count">{{ col.count }}</span>
            </div>
          </section>

          <div
            class="fog"
            v-if="fogs[`${col.x}:${col.y}`] &&
            fogs[`${col.x}:${col.y}`].isFog &&
            player &&
            !player.fogs[`${col.x}:${col.y}`]"
          ></div>
        </div>
      </div>
    </div>
    <div class="btn-leave-game">
      <img class="fadeIn" src="../assets/icons/logout.svg" @click="leaveGame" />
    </div>
  </div>
</template>

<script>
import { directions, domain } from "../config";

export default {
  props: {
    players: {
      type: [Object, Array]
    },
    gameId: {
      type: [String, Number],
      required: true
    },
    fogs: {
      type: Object,
      required: true
    },
    mapData: {
      type: [Object, Array]
    },
    towerSound: {
      type: [Boolean]
    },
    player: {
      type: Object
    }
  },
  data: () => ({
    domain: domain(),
    pageLoad: false,
    availablePoints: {},
    me: {},
    enemies: {},
    availableFog: {}
  }),
  methods: {
    leaveGame() {
      this.$socket.emit("playerDie", { gameId: this.gameId });
    },
    activatePositions(x, y) {
      this.availablePoints = {};
      if (this.player.x === x && this.player.y === y) {
        this.availablePoints[`${x - 1}:${y}`] = "up";
        this.availablePoints[`${x + 1}:${y}`] = "down";
        this.availablePoints[`${x}:${y - 1}`] = "left";
        this.availablePoints[`${x}:${y + 1}`] = "right";
      } else {
        this.$socket.emit("moveTo", {
          x,
          y,
          gameId: this.gameId,
          selection: true
        });
      }
    },
    moveHere(direction) {
      this.availablePoints = {};
      this.$socket.emit("move", { direction, gameId: this.gameId });
    },
    see(col) {
      return (
        this.fogs[`${col.x}:${col.y}`] &&
        this.fogs[`${col.x}:${col.y}`].isFog &&
        this.player &&
        this.player.fogs[`${col.x}:${col.y}`]
      );
    },
    playAudio(src) {
      let audio = document.getElementById(src);
      audio.play();
    }
  },
  mounted() {
    // smoothscroll.polyfill();
    this.pageLoad = true;
    setTimeout(() => {
      let st = (this.player.x - 5) * 60;
      let sl = (this.player.y - 5) * 60;
      this.$refs.map.scrollTop = st > 0 ? st : 0;
      this.$refs.map.scrollLeft = sl > 0 ? sl : 0;
    }, 1000);
  }
};
</script>

<style lang="scss" scoped src="@/assets/scss/components/map.scss">
</style>