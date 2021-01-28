<template>
  <v-layout justify-space-between column fill-height>
    <template>
      <vue-scroll>
        <v-row class="mx-1 px-0">
          <v-col class="mt-0 pt-0">
            <div v-if="activeTopic !== 0">
              <div class="ma-2 font-weight-medium">Unemployment</div>
              <v-divider></v-divider>
              <bar-chart :topicIndex="0"></bar-chart>
            </div>

            <div v-if="activeTopic !== 1">
              <div class="ma-2 font-weight-medium">GDP</div>
              <v-divider></v-divider>
              <bar-chart :topicIndex="1"></bar-chart>
              <!-- <bar-chart v-if="activeTopic !== 1" :topicIndex="1"></bar-chart> -->
            </div>

            <div v-if="activeTopic !== 2">
              <div class="ma-2 font-weight-medium">Spendings (2020)</div>
              <v-divider></v-divider>
              <bubble-chart :topicIndex="2"></bubble-chart>
              <!-- <bubble-chart
                v-if="activeTopic !== 2"
                :topicIndex="2"
              ></bubble-chart> -->
            </div>

            <!-- BUBBLE CHART HERE -->
          </v-col>
        </v-row>
      </vue-scroll>
    </template>
  </v-layout>
</template>

<script>
//Store imports
import { mapGetters } from 'vuex';
import { mapFields } from 'vuex-map-fields';
import UrlUtil from '../../utils/Url';
import { SharedMethods } from '../../mixins/SharedMethods';
import { EventBus } from '../../EventBus';
import BarChart from '../viewer/chart/BarChart';
import BubbleChart from '../viewer/chart/BubbleChart'

export default {
  mixins: [SharedMethods],
  data() {
    return {};
  },
  components: {
    'bar-chart': BarChart,
    'bubble-chart': BubbleChart
  },
  computed: {
    ...mapGetters('map', {
      map: 'map',
      csvData: 'csvData',
      topics: 'topics',
      activeTopic: 'activeTopic'
    }),
    ...mapGetters('app', {
      sidebarHtml: 'sidebarHtml',
      postIcons: 'postIcons'
    }),
    ...mapFields('map', {
      layers: 'layers'
    })
  },
  methods: {
    parseUrl(url) {
      return UrlUtil.parseUrl(url);
    },
    deletePost(postFeature) {
      EventBus.$emit('deletePost', postFeature);
    },
    editPost(postFeature) {
      EventBus.$emit('editPost', postFeature);
    },
    mouseOut() {
      this.popup.highlightLayer.getSource().clear();
    }
  },
  watch: {
    $route(newValue, oldValue) {
      if (oldValue.path === newValue.path) {
        return;
      }
    }
  }
};
</script>

<style lang="css" scoped>
.sidepanel-header {
  width: 100%;
  text-align: center;
}
.col >>> img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  overflow: hidden;
}
</style>
