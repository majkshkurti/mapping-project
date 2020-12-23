<template>
  <div>
    <v-tooltip left>
      <template v-slot:activator="{ on }">
        <v-btn
          class="play"
          v-on="on"
          fab
          dark
          color="#dc143c"
          @click="togglePlay"
        >
          <v-icon medium>{{
            isPlaying ? 'play_circle' : 'stop'
          }}</v-icon>
        </v-btn>
      </template>
      <span>{{isPlaying ? 'Play' : 'Stop'}}</span>
    </v-tooltip>
  </div>
</template>
<script>

export default {
  name: 'play',
  data: () => ({
    isPlaying: false
  }),
  methods: {
    togglePlay() {
      this.isPlaying = !this.isPlaying;
    }
  }
};
</script>
<style lang="css" scoped>
.play {
  z-index: 1;
}
</style>
