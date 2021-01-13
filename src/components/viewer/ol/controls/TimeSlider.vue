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
      v-model="current"
      step="1"
      hide-details="auto"
      :max="Object.keys(time[activeTopic]).length - 1"
      min="0"
      ticks
    ></v-slider>
    <v-chip class="ma-2 play" color="#dc143c" text-color="white">
      {{ getYear }}
    </v-chip>
  </v-row>
</template>
<script>
import { mapGetters } from 'vuex';
import { EventBus } from '../../../../EventBus';

export default {
  name: 'play',
  data: () => ({
    isPlaying: false,
    current: 0,
    timeInterval: null,
    time: {
      0: {
        UNEMP_2019: '2019',
        UNEMP_2020: '2020',
        UNEMP_2021: '2021'
      },
      1: {
        GDP_19_Q1: 'Q1 2019',
        GDP_19_Q2: 'Q2 2019',
        GDP_19_Q3: 'Q3 2019',
        GDP_19_Q4: 'Q4 2019',
        GDP_20_Q1: 'Q1 2020',
        GDP_20_Q2: 'Q2 2020',
        GDP_20_Q3: 'Q3 2020',
        GDP_20_Q4: 'Q4 2020',
        GDP_21_Q1: 'Q1 2021',
        GDP_21_Q2: 'Q2 2021'
      },
      2: {}
    }
  }),
  computed: {
    ...mapGetters('map', { activeTopic: 'activeTopic' }),
    getYear() {
      const keys = Object.keys(this.time[this.activeTopic]);
      const currentKey = this.time[this.activeTopic][keys[this.current]];
      return currentKey;
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
      const keys = Object.keys(this.time[this.activeTopic]);
      this.timeInterval = setInterval(() => {
        if (this.current < keys.length - 1) {
          this.current += 1;
        } else {
          this.current = 0;
        }
      }, 1000);
      EventBus.$emit('play');
    },
    stopPlaying() {
      this.isPlaying = false;
      clearInterval(this.timeInterval);
      EventBus.$emit('stop');
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
