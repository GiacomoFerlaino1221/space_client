<template>
  <div class="game fadeIn">
    <m-panel :players="game.map.players" :land="game.map.land" />
    <m-map
      :players="game.map.players"
      :gameId="game.id"
      :fogs="game.map.fogs"
      :mapData="game.map.mapData"
    />
  </div>
</template>

<script>
export default {
  props: {
    game: {
      type: Object,
      required: true
    },
    pos_x: {
      type: [Number, String]
    },
    pos_y: {
      type: [Number, String]
    }
  },
  data: () => ({
    id: "",
    user: {}
  }),
  mounted() {
    this.id = String(this.$route.params.id).replace("token=", "");
    this.$socket.emit("init", { id: this.id });

    // Open TM if !user
    this.$socket.on("user", async data => {
      try {
        if (!data.id) {
          let a = document.getElementById("tm");
          a.click();
          this.user = {};
        } else {
          this.user = data;
        }
      } catch (e) {
        console.log(e);
      }
    });
  }
};
</script>

<style lang="scss" scoped src="@/assets/scss/components/game.scss">
</style>