<template>
  <div id="ol-map-container">
    <!-- Map Controls -->
    <map-legend color="#dc143c" />
    <div style="position:absolute;right:30%;bottom:10px;">
      <time-slider></time-slider>
    </div>
    <div style="position:absolute;left:20px;top:10px;">
      <zoom-control :map="map" />
      <full-screen />
    </div>

    <!-- Popup overlay  -->
    <overlay-popup
      :title="
        popup.activeFeature
          ? popup.activeFeature.get('category') ||
            popup.activeFeature.get('title')
            ? popup.activeFeature.get('category') ||
              popup.activeFeature.get('title')
            : popup.activeLayer
            ? popup.activeLayer.get('name')
            : ''
          : ''
      "
      v-show="popup.isVisible"
      ref="popup"
    >
      <v-btn icon>
        <v-icon>close</v-icon>
      </v-btn>
      <template v-slot:close>
        <v-btn @click="closePopup()" icon>
          <v-icon>close</v-icon>
        </v-btn>
      </template>
      <template v-slot:body>
        <vue-scroll ref="vs">
          <div style="max-height:280px;" class="pr-2">
            <div class="body-2" v-for="item in popupInfo" :key="item.property">
              <span
                v-if="isPopupRowVisible(item)"
                v-html="
                  `<strong>${mapPopupPropName(
                    item,
                    popup.activeLayer
                  )}: </strong>` + item.value
                "
              ></span>
            </div>
          </div>
        </vue-scroll>
      </template>
    </overlay-popup>

    <!-- Progress loader -->
    <progress-loader
      :value="progressLoading.value"
      :progressColor="progressLoading.progressColor"
      :message="progressLoading.message"
    ></progress-loader>
    <!-- Show snackbar -->
    <snackbar style="margin-top:60px;"></snackbar>
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

// style imports
import { popupInfoStyle } from '../../../style/OlStyleDefs';

// import the app-wide EventBus
import { EventBus } from '../../../EventBus';

// utils imports
import { isCssColor } from '../../../utils/Helpers';
import { LayerFactory } from '../../../factory/OlLayer';

//Store imports
import { mapMutations, mapGetters } from 'vuex';
import { mapFields } from 'vuex-map-fields';

// Map Controls
import OverlayPopup from './controls/Overlay';
import ZoomControl from './controls/ZoomControl';
import FullScreen from './controls/FullScreen';
import Legend from './controls/Legend';
import TimeSlider from './controls/TimeSlider';

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
import { get as getProjection } from 'ol/proj';

import { gdpStyle } from '../../../style/OlStyleDefs';

export default {
  components: {
    'overlay-popup': OverlayPopup,
    'map-legend': Legend,
    'zoom-control': ZoomControl,
    'full-screen': FullScreen,
    'progress-loader': ProgressLoader,
    'time-slider': TimeSlider,
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
      layerVisibilityState: {}
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
      // Get Info
      me.setupMapClick();
      // Pointer Move
      me.setupMapPointerMove();
      // Move end event
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
    const mapProjection = getProjection('EPSG:54030');
    const projExtent = mapProjection.getExtent();
    console.log(projExtent);
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
  },
  methods: {
    /**
     * Creates the OL layers due to the map "layers" array in app config.
     * @return {ol.layer.Base[]} Array of OL layer instances
     */
    createLayers() {
      const me = this;
      // Get Info layer
      me.createGetInfoLayer();
      this.$appConfig.map.layers.forEach(lConf => {
        const layer = LayerFactory.getInstance(lConf);

        me.setLayer(layer);
        if (layer.get('name') === 'gdp') {
          console.log(gdpStyle);
          layer.setStyle(gdpStyle);
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
        style: popupInfoStyle()
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

      me.popup.showInSidePanel = false;
    },

    /**
     * Show getInfo popup.
     */
    showPopup(clickCoord) {
      let position = this.popup.activeFeature.getGeometry().getCoordinates();
      // Correct popup position (used feature coordinates insteaad of mouse)
      let closestPoint;
      // Closest point doesn't work with vector tile layers.
      if (position) {
        closestPoint = this.popup.activeFeature
          .getGeometry()
          .getClosestPoint(clickCoord);
      } else {
        closestPoint = clickCoord;
      }
      this.map.getView().animate({
        center: closestPoint,
        duration: 400
      });
      this.popup.popupOverlay.setPosition(closestPoint);
      this.popup.isVisible = true;
      this.popup.title = 'Info';
    },
    /**
     * Zooms to feature, add a cloned feature to the highlight layer and set the position of popup undefined
     * move the popup content to sidepanel and replace legend with feature image if exist.
     *
     */
    zoomToFeature() {
      const geometry = this.popup.activeFeature.getGeometry();
      this.popup.highlightLayer.getSource().clear();
      const clonedFeature = this.popup.activeFeature.clone();
      clonedFeature.set('isClone', true);
      if (['Point', 'MultiPoint'].includes(geometry.getType())) {
        const layerStyle = this.popup.activeLayer.getStyle();
        clonedFeature.setStyle(feature => {
          const styles = [];
          const popupInfoStyleObj = popupInfoStyle()(feature);
          if (Array.isArray(popupInfoStyleObj)) {
            styles.push(...popupInfoStyleObj);
          } else {
            styles.push(popupInfoStyleObj);
          }
          if (layerStyle instanceof Function) {
            const layerStyleObj = layerStyle(feature);
            if (Array.isArray(layerStyleObj)) {
              layerStyleObj.forEach(style => {
                if (style.setZIndex) {
                  style.setZIndex(2000);
                }
              });
              styles.push(...layerStyleObj);
            } else {
              if (layerStyleObj.setZIndex) {
                layerStyleObj.setZIndex(2000);
              }
              styles.push(layerStyleObj);
            }
          } else if (Array.isArray(layerStyle)) {
            styles.push(...layerStyle);
          } else {
            styles.push(layerStyle);
          }
          return styles;
        });
      }
      this.popup.highlightLayer.getSource().addFeature(clonedFeature);
      if (!['Point', 'MultiPoint'].includes(geometry.getType())) {
        // Zoom to extent adding a padding to the extent
        this.previousMapPosition = {
          center: this.map.getView().getCenter(),
          zoom: this.map.getView().getZoom()
        };

        this.map.getView().fit(geometry.getExtent(), {
          padding: [100, 100, 100, 100],
          duration: 800
        });
      }

      // Close popup
      this.popup.popupOverlay.setPosition(undefined);
      this.popup.showInSidePanel = true;
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
          if (
            this.popup.activeFeature &&
            this.popup.activeFeature.getId() === `clone.${feature.getId()}`
          )
            return;
          const topic = this.topics[this.activeTopic];
          const fieldName = `${topic.field}_${this.currentYear}`;
          const attr = feature.get(fieldName);
          if (!attr) return;
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

          overlayEl.innerHTML = `${topic.title}: ${attr}%, ${feature.get('name')}`;
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
     * Map click event for Module.
     */
    setupMapClick() {
      const me = this;
      const map = me.map;

      me.mapClickListenerKey = map.on('click', async evt => {
        if (me.activeInteractions.length > 0) {
          return;
        }

        let feature, layer;
        this.map.forEachFeatureAtPixel(
          evt.pixel,
          (f, l) => {
            // Order of features is based is based on zIndex.
            // First feature is on top, last feature is on bottom.
            if (f && f.get('isClone')) {
              return false;
            }
            if (
              !feature &&
              l.get('isInteractive') !== false &&
              l.get('queryable') !== false
            ) {
              feature = f;
              layer = l;
            }
          },
          {
            hitTolerance: 3
          }
        );
        // Check if layer is interactive
        if (
          (layer && layer.get('isInteractive') === false) ||
          (layer && layer.get('queryable') === false)
        )
          return;

        this.popup.activeLayer = layer;

        if (feature) {
          // Check if feature has lightbox array of images
          this.previousMapPosition = null;
          this.popup.activeFeature = feature.clone ? feature.clone() : feature;

          if (feature.getId()) {
            this.popup.activeFeature.setId(`clone.${feature.getId()}`);
          }
          this.zoomToFeature();
        }
      });
    },
    isPopupRowVisible(item) {
      if (!['null', '---'].includes(item.value)) {
        return (
          this.popup.diveVisibleProps.includes(item.property) &&
          !this.hiddenProps.includes(item.property)
        );
      } else {
        return false;
      }
    },

    ...mapMutations('map', {
      setMap: 'SET_MAP',
      setLayer: 'SET_LAYER',
      setPersistentLayer: 'SET_PERSISTENT_LAYER',
      removeAllLayers: 'REMOVE_ALL_LAYERS'
    })
  },
  computed: {
    ...mapGetters('map', {
      popupInfo: 'popupInfo'
    }),
    ...mapFields('map', {
      previousMapPosition: 'previousMapPosition',
      popup: 'popup',
      activeTopic: 'activeTopic',
      currentYear: 'currentYear',
      topics: 'topics'
    }),

    hiddenProps() {
      const hiddenProps = this.$appConfig.map.featureInfoHiddenProps;
      return hiddenProps || [];
    }
  },
  watch: {
    activeInteractions() {
      if (!this.dblClickZoomInteraction) return;
      if (this.activeInteractions.length > 0) {
        this.dblClickZoomInteraction.setActive(false);
      } else {
        this.dblClickZoomInteraction.setActive(true);
      }
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
