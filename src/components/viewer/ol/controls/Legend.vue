<template>
  <div>
    <v-tooltip v-show="!isVisible" right>
      <template v-slot:activator="{ on }">
        <v-btn
          v-on="on"
          style="position:fixed;left:16px;bottom:40px;z-index:1000;"
          v-show="!isVisible"
          color="#dc143c"
          @click="toggleLegend"
          fab
          small
          class="white--text"
        >
          <v-icon>fas fa-layer-group</v-icon>
        </v-btn>
      </template>
      <span>Legend</span>
    </v-tooltip>
    <v-expansion-panels
      v-model="panel"
      v-show="isVisible"
      class="elevation-3"
      :width="isVisible ? '250px' : '0px'"
      style="position:absolute;left:25px;bottom:20px;max-width:200px;opacity:85%;"
    >
      <v-btn
        v-show="isVisible"
        @click="toggleLegend"
        class="legend-toggle-button white--text"
        text
        min-width="30px"
        x-small
        style="z-index:100;background-color:rgb(228, 76, 107);position:absolute;bottom:30px;right:-19px;"
      >
        <v-icon class="ml-0" x-small>fas fa-chevron-up</v-icon></v-btn
      >
      <v-expansion-panel class="my-0" :style="`background-color: white;`">
        <v-expansion-panel-content
          v-show="isVisible"
          v-if="isVisible"
          style="max-height:400px;min-height:30px;"
        >
          <vue-scroll>
            <template v-for="(item, index) in layers">
              <div
                :key="index"
                v-if="
                  item.getVisible() === true &&
                    item.get('displayInLegend') === true
                "
                style="padding-right:10px;"
              >
                <p class="grey--text text--darken-2 pb-0 mb-1 mt-2 subtitle-2">
                  {{
                    item.get('legendDisplayName') || humanize(item.get('name'))
                  }}
                </p>

                <v-divider></v-divider>

                <!-- For vector layer like network , ppf or other edit layers.  -->
                <div v-if="item.get('legendUrl')">
                  <img
                    style="max-width: 100%;"
                    :src="item.get('legendUrl')"
                    class="white--text mt-0 pt-0"
                  />
                </div>
              </div>
            </template>
          </vue-scroll>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>
<script>
import { Mapable } from '../../../../mixins/Mapable';
import { humanize } from '../../../../utils/Helpers';
import { mapGetters } from 'vuex';

export default {
  mixins: [Mapable],
  name: 'map-legend',
  props: {
    color: { type: String, default: '#4CAF50' }
  },
  data() {
    return {
      panel: 0,
      isReady: false,
      title: '',
      isVisible: true
    };
  },
  methods: {
    humanize,
    toggleLegend() {
      this.isVisible = !this.isVisible;
    }
  },
  computed: {
    ...mapGetters('map', {
      layers: 'layers'
    })
  }
};
</script>
<style lang="css" scoped>
.v-expansion-panel-header {
  min-height: 30px;
  padding: 5px;
}

.v-expansion-panel-content >>> .v-expansion-panel-content__wrap {
  padding: 2px 0px 0px 5px;
}

.layer-input >>> .v-messages {
  min-height: 0px;
}
.legend-toggle-button {
  transform: rotate(-90deg);
  -ms-transform: rotate(-90deg);
  -moz-transform: rotate(-90deg);
  -webkit-transform: rotate(-90deg);
  -o-transform: rotate(-90deg);
  transform-origin: bottom right;
}

/* * {
  scrollbar-width: thin;
  scrollbar-color: rgb(206, 206, 206) #ffffff;
}
*::-webkit-scrollbar {
  width: 12px;
}
*::-webkit-scrollbar-track {
  background: #ffffff;
}
*::-webkit-scrollbar-thumb {
  background-color: rgb(206, 206, 206);
  border-radius: 20px;
  border: 3px solid #ffffff;
} */
</style>
