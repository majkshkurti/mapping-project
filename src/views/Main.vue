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

    <v-app-bar app clipped-right height="60" color="#dc143c" dark>
      <!-- <v-img contain src="/public/icons/covid_19.png"></v-img>  TODO: Use this image. -->
      <v-icon large class="mr-2">fas fa-virus</v-icon>

      <v-toolbar-title
        @click="goToHome()"
        flat
        class="logo headline font-weight-bold black--text mr-3"
        >COVID19 IMPACT</v-toolbar-title
      >
      <v-spacer></v-spacer>

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
import { mapMutations } from 'vuex';

export default {
  name: 'wg-app',

  computed: {},
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
    goToHome() {
      if (this.$router.currentRoute.name === 'oil') {
        EventBus.$emit('resetMap');
      }
      this.$router.push({ name: 'oil' });
    },
    zoomToLocation() {
      if (this.region === 'local') {
        EventBus.$emit('zoomToLocation');
      }
    },

    ...mapMutations('map', {
      setActiveLayerGroup: 'SET_ACTIVE_LAYERGROUP'
    })
  },
  created() {},
  watch: {
    $route(newValue, oldValue) {
      if (oldValue.path === newValue.path) {
        return;
      }

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
