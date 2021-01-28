<template>
  <v-app id="wg-app" data-app :class="{ 'wg-app': true }">
    <v-expand-transition>
      <v-navigation-drawer
        v-model="drawer"
        width="460"
        class="elevation-6"
        stateless
        app
        clipped
        right
      >
        <side-panel></side-panel>
      </v-navigation-drawer>
    </v-expand-transition>

    <v-app-bar app clipped-right height="60" color="#00000e" dark>
      <!-- <v-img contain src="/public/icons/covid_19.png"></v-img>  TODO: Use this image. -->
      <v-icon large class="mr-2">fas fa-virus</v-icon>

      <v-toolbar-title
        flat
        class="logo headline font-weight-bold black--text mr-3"
        >COVID19 IMPACT</v-toolbar-title
      >
      <v-spacer></v-spacer>
      <div v-for="(item, index) in topics" :key="index">
        <v-btn
          min-width="140"
          class="mx-10"
          :dark="index === activeTopic ? false : true"
          @click="setActiveTopic(index)"
          :color="index === activeTopic ? 'white' : '#00000'"
          :class="{
            'elevation-0': index !== activeTopic,
            'font-weight-bold black--text': index === activeTopic,
            'elevation-6': index === activeTopic
          }"
        >
          {{ item.title }}
        </v-btn>
      </div>
      <v-spacer></v-spacer>

      <v-btn icon @click.stop="drawer = !drawer"
        ><v-icon medium>{{ drawer ? '$close' : '$menu' }}</v-icon></v-btn
      >
    </v-app-bar>

    <v-content>
      <v-container style="max-height: 100%;" fluid fill-height class="pa-0">
        <app-viewer />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import { EventBus } from '../EventBus.js';
import Viewer from '../components/viewer/viewer';
import SidePanel from '../components/core/SidePanel';
//Store imports
import { mapMutations, mapGetters } from 'vuex';
import { mapFields } from 'vuex-map-fields';
import Papa from 'papaparse';
import { reshapeData, groupBy } from '../utils/Helpers';
export default {
  name: 'wg-app',

  computed: {
    ...mapGetters('map', {
      topics: 'topics',
      activeTopic: 'activeTopic'
    }),
    ...mapMutations('map', {
      setCurrentTimeIndex: 'SET_CURRENT_TIME_INDEX'
    }),
    ...mapFields('map', {
      csvData: 'csvData',
      currentTimeIndex: 'currentTimeIndex'
    })
  },
  components: {
    'app-viewer': Viewer,
    'side-panel': SidePanel
  },
  data() {
    return {
      drawer: true
    };
  },
  methods: {
    changeMap(index) {
      this.activeMap = index;
    },
    zoomToLocation() {
      if (this.region === 'local') {
        EventBus.$emit('zoomToLocation');
      }
    },

    ...mapMutations('map', {
      setActiveTopic: 'SET_ACTIVE_TOPIC'
    }),
    fetchCsvData() {
      this.topics.forEach((topicObj, index) => {
        const topic = topicObj.name;
        if (!this.csvData[topic]) {
          Papa.parse(`./static/${topic}.csv`, {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: results => {
              let minValue = 0;
              let maxValue = 0;
              results.data.forEach(item => {
                const value = parseInt(item[topic]);
                if (value <= minValue) {
                  minValue = value;
                }
                if (value >= maxValue) {
                  maxValue = value;
                }
              });
              if (Object.keys(results.data[0]).length === 3) {
                let timeGrouped = {};
                const reshapedData = reshapeData(results.data);
                reshapedData.forEach(data => {
                  timeGrouped[data.date] = data;
                });
                this.$set(this.csvData, topic, {
                  timeGrouped: timeGrouped,
                  values: reshapedData,
                  min: minValue,
                  max: maxValue
                });
              } else {
                const reshapedData = groupBy(results.data, 'location');

                this.$set(this.csvData, topic, {
                  timeGrouped: {},
                  locationGrouped: reshapedData,
                  values: results.data,
                  min: minValue,
                  max: maxValue
                });
                console.log(this.csvData);
              }
              if (index == this.topics.length - 1) {
                EventBus.$emit('csvLoaded');
              }
            }
          });
        }
      });
    }
  },
  created() {
    this.fetchCsvData();
  },
  watch: {
    $route(newValue, oldValue) {
      if (oldValue.path === newValue.path) {
        return;
      }
      this.fetchCsvData();
      this.zoomToLocation();
    }
  },
  mounted() {
    // inform registered cmps that the app is mounted and the dynamic
    // components are available
    EventBus.$emit('app-mounted');
  }
};
</script>
