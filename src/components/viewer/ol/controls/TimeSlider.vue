<template>
  <v-row align="center" no-gutters>
    
      <v-btn
        class="play elevation-0 mr-2"
        small
        fab
        dark
        color="#dc143c"
        @click="togglePlay"
      >
        <v-icon large>{{ isPlaying ? 'stop' : 'play_arrow' }}</v-icon>
      </v-btn>
      <v-slider
        style="background-color:white;border-radius: 20px;z-index:3;width:300px;"
        class="px-2 timeslider"
        step="10"
        hide-details="auto"
        max="50"
        min="-50"
        ticks
      ></v-slider>
  </v-row>
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

>>> .v-slider__thumb {
  height: 15px;
  width: 15px;
}

>>> .v-slider--horizontal .v-slider__track-container {
  height: 10px;
}

.timeslider >>> .v-input__slot {
  margin-bottom: 0px;
}
.timeslider >>> .v-messages theme--light {
  display: none;
}
</style>
