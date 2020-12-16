<template>
  <v-layout justify-space-between column fill-height>
    <template>
      <vue-scroll>
        <v-row class="mx-0 px-0">
          <v-col class="mt-0 pt-0"> </v-col>
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
import { formatPopupRows } from '../../utils/Layer';

export default {
  mixins: [SharedMethods],
  data() {
    return {
      isIframeLoading: true
    };
  },
  computed: {
    ...mapGetters('map', {
      map: 'map',
      popupInfo: 'popupInfo'
    }),
    ...mapGetters('app', {
      sidebarHtml: 'sidebarHtml',
      postIcons: 'postIcons'
    }),
    ...mapFields('map', {
      popup: 'popup',
      layers: 'layers'
    })
  },
  methods: {
    formatPopupRows,
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
    },
    storeMapPosition() {}
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
