import { getField, updateField } from 'vuex-map-fields';
import {
  formatPopupRows,
 
} from '../../utils/Layer';


const state = {
  map: null,
  messages: {
    snackbar: {
      type: 'info',
      message: '',
      state: false,
      timeout: 2000
    }
  },
  popup: {
    highlightLayer: null,
    worldExtentLayer: null,
    highlightVectorTileLayer: null,
    selectedCorpNetworkLayer: null,
    popupOverlay: null,
    title: 'Info',
    isVisible: false,
    activeFeature: null,
    activeLayer: null,
    exludedProps: [
      'id',
      'geometry',
      'geom',
      'orgin_geometry',
      'osm_id',
      'gid',
      'layerName'
    ],
    diveVisibleProps: ['title', 'entitiy'],
    showInSidePanel: false
  },
  layers: {}, // Only for operational layers
  activeLayerGroup: null,
  colorMapEntities: {}
};

const actions = {
  
}

const getters = {
  map: state => state.map,
  layers: state => state.layers,
  messages: state => state.messages,
  snackbar: state => state.messages.snackbar,
  popup: state => state.popup,
  popupInfo: state => {
    const feature = state.popup.activeFeature;
    if (!feature) return;
    return formatPopupRows(feature, state.popup.exludedProps);
  },
  persistentLayers: state => state.persistentLayers,
  postEditLayer: state => state.postEditLayer,
  lastSelectedLayer: state => state.lastSelectedLayer,

  getField
};


const mutations = {
  TOGGLE_SNACKBAR(state, payload) {
    Object.assign(state.messages.snackbar, payload);
  },
  SET_LAYER(state, layer) {
    if (layer.get('name')) {
      if (!state.layers[layer.get('name')]) {
        state.map.addLayer(layer);
      }
      state.layers[layer.get('name')] = layer;
    }
  },
  SET_PERSISTENT_LAYER(state, layer) {
    if (layer.get('name')) {
      state.persistentLayers[layer.get('name')] = layer;
      state.map.addLayer(layer);
    }
  },
  SET_MAP(state, map) {
    state.map = map;
  },
  updateField
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
