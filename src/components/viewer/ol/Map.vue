<template>
  <div id="ol-map-container">
    <!-- Map Controls -->
    <map-legend color="#dc143c" />
    <div style="position:absolute;right:12%;bottom:10px;">
      <time-slider></time-slider>
    </div>
    <div style="position:absolute;left:20px;top:10px;">
      <zoom-control :map="map" />
      <full-screen />
    </div>

    <!-- Progress loader -->
    <progress-loader
      :value="progressLoading.value"
      :progressColor="progressLoading.progressColor"
      :message="progressLoading.message"
    ></progress-loader>
    <!-- Show snackbar -->
    <snackbar style="margin-top:60px;"></snackbar>
    <!-- Popup overlay  -->
    <overlay-popup
      :color="'#00000e'"
      :title="popup.title"
      v-show="popup.isVisible"
      ref="popup"
    >
      <template v-slot:close>
        <v-btn icon @click="closePopup">
          <v-icon>close</v-icon>
        </v-btn>
      </template>
      <template v-slot:body>
        <div style="max-height:800px;overflow:hidden;">
          <vue-scroll>
            <div>
              <line-chart></line-chart>
            </div>
          </vue-scroll>
        </div>
      </template>
    </overlay-popup>
  </div>
</template>

<script>
import Vue from 'vue';

// ol imports
import Map from 'ol/Map';
import View from 'ol/View';
import Overlay from 'ol/Overlay';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
// import the app-wide EventBus
import { EventBus } from '../../../EventBus';

// utils imports
import { isCssColor } from '../../../utils/Helpers';
import { LayerFactory } from '../../../factory/OlLayer';

//Store imports
import { mapMutations, mapGetters } from 'vuex';
import { mapFields } from 'vuex-map-fields';

// Map Controls
import ZoomControl from './controls/ZoomControl';
import FullScreen from './controls/FullScreen';
import Legend from './controls/Legend';
import TimeSlider from './controls/TimeSlider';
import OverlayPopup from './controls/Overlay';
import LineChart from '../chart/LineChart';

// Interactions
import DoubleClickZoom from 'ol/interaction/DoubleClickZoom';
import { defaults as defaultInteractions } from 'ol/interaction';

// Ol controls
import { defaults as defaultControls, Attribution } from 'ol/control';

// Shared methods
import { SharedMethods } from '../../../mixins/SharedMethods';

// Progress loader
import ProgressLoader from '../../core/ProgressLoader';
import Snackbar from '../../core/Snackbar';

import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

import {
  mainStyle,
  getFeatureHighlightStyle
} from '../../../style/OlStyleDefs';

export default {
  components: {
    'map-legend': Legend,
    'zoom-control': ZoomControl,
    'full-screen': FullScreen,
    'progress-loader': ProgressLoader,
    'time-slider': TimeSlider,
    'overlay-popup': OverlayPopup,
    'line-chart': LineChart,
    Snackbar
  },
  name: 'app-ol-map',
  data() {
    return {
      zoom: this.$appConfig.map.zoom,
      center: this.$appConfig.map.center,
      minZoom: this.$appConfig.map.minZoom,
      maxZoom: this.$appConfig.map.maxZoom,
      extent: this.$appConfig.map.extent,
      color: this.$appConfig.controlsColor,
      activeInteractions: [],
      getInfoResult: [],
      radius: 300,
      mousePosition: undefined,
      progressLoading: {
        progressColor: '#dc143c',
        value: false
      },
      ops: {
        vuescroll: {
          sizeStrategy: 'number'
        }
      },
      noMapReset: false,
      layerVisibilityState: {},
      isPopupVisible: false
    };
  },
  mixins: [SharedMethods],
  mounted() {
    var me = this;
    // Make the OL map accessible for Mapable mixin even 'ol-map-mounted' has
    // already been fired. Don not use directly in cmps, use Mapable instead.
    Vue.prototype.$map = me.map;
    // Send the event 'ol-map-mounted' with the OL map as payload
    EventBus.$emit('ol-map-mounted', me.map);

    // resize the map, so it fits to parent
    window.setTimeout(() => {
      me.map.setTarget(document.getElementById('ol-map-container'));
      me.map.updateSize();
      // adjust the bg color of the OL buttons (like zoom, rotate north, ...)
      me.setOlButtonColor();
      // Pointer Move
      me.setupMapPointerMove();
      // Setup Map click
      me.setupMapClick();
      // Create popup overlay for get info
      me.createPopupOverlay();
    }, 200);
  },
  created() {
    var me = this;
    // Make map rotateable according to property
    const attribution = new Attribution({
      collapsible: true
    });

    // Need to reference as we should deactive double click zoom when there
    // are active interaction like draw/modify
    this.dblClickZoomInteraction = new DoubleClickZoom();
    proj4.defs(
      'EPSG:54030',
      '+proj=robin +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs'
    );
    register(proj4);

    me.map = new Map({
      layers: [],
      interactions: defaultInteractions({
        altShiftDragRotate: true,
        doubleClickZoom: false
      }).extend([this.dblClickZoomInteraction]),
      controls: defaultControls({
        attribution: false,
        zoom: false
      }).extend([attribution]),
      view: new View({
        center: [0, 0],
        zoom: 2
      })
    });
    //Add map to the vuex store.
    me.setMap(me.map);
    // Create layers from config and add them to map
    me.createLayers();
    me.createGetInfoLayer();
  },
  methods: {
    /**
     * Creates the OL layers due to the map "layers" array in app config.
     * @return {ol.layer.Base[]} Array of OL layer instances
     */
    createLayers() {
      const me = this;
      // Get Info layer
      this.$appConfig.map.layers.forEach(lConf => {
        const layer = LayerFactory.getInstance(lConf);

        me.setLayer(layer);
        if (layer.get('name') === 'countries') {
          layer.setStyle(mainStyle);
        }
      });
    },
    /**
     * Creates a layer to visualize selected GetInfo features.
     */
    createGetInfoLayer() {
      // For Vector selection
      const source = new VectorSource({
        wrapX: false
      });
      const vector = new VectorLayer({
        name: 'Get Info Layer',
        zIndex: 3000,
        source: source,
        style: getFeatureHighlightStyle
      });
      this.popup.highlightLayer = vector;
      this.map.addLayer(vector);
    },

    /**
     * Sets the background color of the OL buttons to the color property.
     */
    setOlButtonColor() {
      var me = this;

      if (isCssColor(me.color)) {
        // directly apply the given CSS color
        const rotateEl = document.querySelector('.ol-rotate');
        if (rotateEl) {
          rotateEl.className += ' elevation-5';
          rotateEl.borderRadius = '40px';
          const rotateElStyle = document.querySelector(
            '.ol-rotate .ol-rotate-reset'
          ).style;
          rotateElStyle.backgroundColor = me.color;
          rotateElStyle.borderRadius = '40px';
        }
        const attrEl = document.querySelector('.ol-attribution');
        if (attrEl) {
          attrEl.className += ' elevation-5';
          const elStyle = document.querySelector(
            ".ol-attribution button[type='button']"
          ).style;
          elStyle.backgroundColor = me.color;
          elStyle.borderRadius = '40px';
        }
      } else {
        // apply vuetify color by transforming the color to the corresponding
        // CSS class (see https://vuetifyjs.com/en/framework/colors)
        const [colorName, colorModifier] = me.color
          .toString()
          .trim()
          .split(' ', 2);

        if (document.querySelector('.ol-rotate')) {
          document
            .querySelector('.ol-rotate .ol-rotate-reset')
            .classList.add(colorName);
          document
            .querySelector('.ol-rotate .ol-rotate-reset')
            .classList.add(colorModifier);
        }
      }
    },

    /**
     * Map pointer move event .
     */
    setupMapPointerMove() {
      let overlayEl;
      // create a span to show map tooltip
      overlayEl = document.createElement('div');
      overlayEl.className = 'tooltip';
      this.overlayEl = overlayEl;
      // wrap the tooltip span in a OL overlay and add it to map
      this.overlay = new Overlay({
        element: overlayEl,
        offset: [22, 12],
        positioning: 'center-left',
        stopEvent: true,
        insertFirst: false
      });
      this.map.addOverlay(this.overlay);

      this.mapPointerMoveListenerKey = this.map.on('pointermove', evt => {
        if (evt.dragging || this.activeInteractions.length > 0) {
          return;
        }
        let feature, layer;
        this.map.forEachFeatureAtPixel(
          evt.pixel,
          (f, l) => {
            // Order of features is based is based on zIndex.
            // First feature is on top, last feature is on bottom.
            if (!feature && l.get('isInteractive') !== false) {
              feature = f;
              layer = l;
            }
          },
          {
            hitTolerance: 3
          }
        );
        this.map.getTarget().style.cursor = feature ? 'pointer' : '';

        if (!feature || !layer.get('hoverable')) {
          overlayEl.innerHTML = null;
          this.overlay.setPosition(undefined);
        } else {
          if (!feature) return;
          const topic = this.topics[this.activeTopic];

          if (layer.get('styleObj')) {
            const { hoverTextColor, hoverBackgroundColor } = JSON.parse(
              layer.get('styleObj')
            );

            hoverBackgroundColor && overlayEl
              ? (overlayEl.style.backgroundColor = hoverBackgroundColor)
              : (overlayEl.style.backgroundColor = '');

            hoverTextColor && overlayEl
              ? (overlayEl.style.color = hoverTextColor)
              : (overlayEl.style.color = '');
          }

          const countryName = feature.get('name').toUpperCase();
          let topicValue = '';
          if (topic.name === 'spendings') {
            topicValue = this.csvData[topic.name].locationGrouped[
              feature.get('name')
            ][0].spendings;
          } else {
            if (!this.currentTime) return;
            const currentTimeObject = this.csvData[topic.name].timeGrouped[
              this.currentTime
            ];
            if (currentTimeObject[countryName]) {
              topicValue = currentTimeObject[countryName];
            }
          }

          if (topic.name === 'spendings') {
            overlayEl.innerHTML = `Spendings (% of GDP): ${topicValue}, ${countryName}`;
          } else {
            overlayEl.innerHTML = `${topic.title}: ${topicValue}%, ${countryName}`;
          }
          this.overlay.setPosition(evt.coordinate);
        }

        this.mousePosition = this.map.getEventPixel(evt.originalEvent);
        // Render is only triggered for spotlight which is visible in zoom levels below 20
        const resolutionLevel = this.map.getView().getResolution();
        if (resolutionLevel <= 20) {
          this.map.render();
        }
      });
    },

    /**
     * Show popup for the get info module.
     */
    createPopupOverlay() {
      const me = this;
      me.popup.popupOverlay = new Overlay({
        element: me.$refs.popup.$el,
        autoPan: false,
        autoPanMargin: 40,
        autoPanAnimation: {
          duration: 250
        }
      });
      me.map.addOverlay(me.popup.popupOverlay);
    },
    /**
     * Closes the popup if user click X button.
     */
    closePopup() {
      const me = this;
      if (me.popup.popupOverlay) {
        me.popup.popupOverlay.setPosition(undefined);
        me.popup.isVisible = false;
      }

      // Clear highligh feature (Don't clear if a corporate network entity is selected)
      if (me.popup.highlightLayer) {
        this.popup.highlightLayer.getSource().clear();
      }

      me.popup.activeFeature = null;
      me.popup.activeLayer = null;
    },
    showPopup(coordinate) {
      // Clear highligh feature (Don't clear if a corporate network entity is selected)
      let position = this.popup.activeFeature.getGeometry().getCoordinates();
      // Correct popup position (used feature coordinates insteaad of mouse)
      let closestPoint;
      // Closest point doesn't work with vector tile layers.
      if (position) {
        closestPoint = this.popup.activeFeature
          .getGeometry()
          .getClosestPoint(coordinate);
      } else {
        closestPoint = coordinate;
      }
      this.map.getView().animate({
        center: closestPoint,
        duration: 400
      });
      this.popup.popupOverlay.setPosition(closestPoint);
      this.popup.isVisible = true;
      this.popup.title = 'Info';
    },
    setupMapClick() {
      const me = this;
      const map = me.map;
      me.mapClickListenerKey = map.on('click', evt => {
        me.closePopup();
        if (this.activeTopic === 2) return;
        let selectedFeatures = me.map.getFeaturesAtPixel(evt.pixel, {
          hitTolerance: 4,
          layerFilter: layerCandidate => {
            return layerCandidate.get('name') === 'countries';
          }
        });
        if (selectedFeatures.length > 0) {
          me.popup.activeFeature = selectedFeatures[0];
          me.popup.highlightLayer
            .getSource()
            .addFeature(me.popup.activeFeature.clone());
          this.showPopup(evt.coordinate);
        }
      });
    },

    ...mapMutations('map', {
      setMap: 'SET_MAP',
      setLayer: 'SET_LAYER',
      setPersistentLayer: 'SET_PERSISTENT_LAYER',
      removeAllLayers: 'REMOVE_ALL_LAYERS'
    })
  },
  computed: {
    ...mapGetters('map', ['currentTime', 'csvData']),
    ...mapFields('map', {
      previousMapPosition: 'previousMapPosition',
      popup: 'popup',
      activeTopic: 'activeTopic',
      currentYear: 'currentYear',
      topics: 'topics'
    })
  },
  watch: {
    activeInteractions() {
      if (!this.dblClickZoomInteraction) return;
      if (this.activeInteractions.length > 0) {
        this.dblClickZoomInteraction.setActive(false);
      } else {
        this.dblClickZoomInteraction.setActive(true);
      }
    },
    activeTopic() {
      this.closePopup();
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
div.ol-attribution {
  bottom: 4px;
  border-radius: 40px;
}

div.ol-control {
  padding: 0px;
  border-radius: 40px;
}

div.ol-control button {
  margin: 0px !important;
}

/* Hover tooltip */
.tooltip {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-style: normal;
  position: relative;
  background-color: rgba(128, 128, 128, 0.9);
  border-radius: 4px;
  color: white;
  padding: 2px 8px;
  font-size: 14px;
  opacity: 1;
  font-weight: bold;
}

.tooltip::before {
  border-right: 6px solid transparent;
  border-left: 6px solid transparent;
  content: '';
  position: absolute;
  bottom: 40%;
  margin-left: -8px;
  left: 0%;
  transform: rotate(90deg);
}

.ol-attribution ul {
  margin: 0;
  padding: 0 0.5em;
  font-size: 0.7rem;
  line-height: 1.375em;
  color: #000;
  text-shadow: 0 0 2px #fff;
}

.spotlight-message {
  background-color: #dc143c;
  position: fixed;
  left: 40%;
  top: 70px;
  color: white;
  padding: 5px;
  border-radius: 5px;
  z-index: 100;
}
</style>
