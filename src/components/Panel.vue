<template>
  <div class="panel">
    <div class="panel-players">
      <div class="panel-players-item" v-for="player in players" :key="player.id">
        <div class="panel-players-item-ava" :class="{ me: player.socket_id === $socket.id }">
          <img
            :src="`${domain}/${player.avatar}` ? `${domain}/${player.avatar}` : ''"
            :class="`panel-players-item-ava-img_${player.color}`"
          />
        </div>
        <span :class="`panel-players-item-land-${player.color}`">{{ player.land }}</span>
      </div>
    </div>
  </div>
</template> 

<script>
import { domain } from "../config";

export default {
  props: {
    players: {
      type: [Array, Object],
      required: true
    },
    land: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    domain: domain()
  })
};
</script>

<style lang="scss" scoped src="@/assets/scss/components/panel.scss">
</style>