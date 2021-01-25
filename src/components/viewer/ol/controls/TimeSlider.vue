<template>
  <v-row align="center" no-gutters>
    <v-btn
      class="play elevation-0 mr-2"
      small
      fab
      dark
      color="#00000e"
      @click="togglePlay"
    >
      <v-icon large>{{ isPlaying ? 'stop' : 'play_arrow' }}</v-icon>
    </v-btn>
    <v-slider
      style="background-color:white;border-radius: 20px;z-index:3;width:300px;"
      class="px-2 timeslider"
      v-model="currentTimeIndex"
      step="1"
      hide-details="auto"
      :max="
        this.csvData[this.topicName]
          ? Object.keys(this.csvData[this.topicName].timeGrouped).length - 1
          : 1
      "
      min="0"
      ticks
    ></v-slider>
    <v-chip
      v-if="currentTime"
      class="ma-2 play"
      color="#00000e"
      text-color="white"
      >{{ currentTime }}
    </v-chip>
  </v-row>
</template>
<script>
import { mapGetters } from 'vuex';
import { mapFields } from 'vuex-map-fields';

import { EventBus } from '../../../../EventBus';

export default {
  name: 'play',
  data: () => ({}),
  computed: {
    ...mapGetters('map', [
      'activeTopic',
      'topics',
      'csvData',
      'layers',
      'currentTime'
    ]),
    ...mapFields('map', {
      currentTimeIndex: 'currentTimeIndex',
      isPlaying: 'isPlaying',
      timeInterval: 'timeInterval',
      activeTopic: 'activeTopic'
    }),
    topicName() {
      return this.topics[this.activeTopic].name;
    }
  },
  watch: {
    currentTimeIndex() {
      this.layers['countries'].changed();
    },
    activeTopic() {
      this.stopPlaying();
      this.currentTimeIndex = 0
    }
  },
  methods: {
    togglePlay() {
      if (this.isPlaying) {
        this.stopPlaying();
      } else {
        this.startPlaying();
      }
    },
    startPlaying() {
      this.isPlaying = true;
      const times = this.csvData[this.topicName].timeGrouped;
      const keys = Object.keys(times);
      this.timeInterval = setInterval(() => {
        if (this.currentTimeIndex < keys.length - 1) {
          this.currentTimeIndex += 1;
        } else {
          this.currentTimeIndex = 0;
        }
      }, 500);
      EventBus.$emit('play');
    },
    stopPlaying() {
      this.isPlaying = false;
      clearInterval(this.timeInterval);
      EventBus.$emit('stop');
      this.layers['countries'].changed();
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
