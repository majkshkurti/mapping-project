import { getField, updateField } from 'vuex-map-fields';

const state = {
  map: null,
  activeTopic: 1,
  currentYear: 2020,
  topics: [
    {
      name: 'unemployment',
      field: 'UNEMP',
      title: 'Unemployment'
    },
    {
      name: 'gdp',
      field: 'GDP',
      title: 'GDP'
    },
    {
      name: 'spending',
      field: 'SPEND',
      title: 'Spendings'
    }
  ],
  messages: {
    snackbar: {
      type: 'info',
      message: '',
      state: false,
      timeout: 2000
    }
  },
  layers: {}, // Only for operational layers
  colorMapEntities: {},
  csvData: {},
  currentTimeIndex: null,
  isPlaying: false,
  timeInterval: null
};

const actions = {};

const getters = {
  map: state => state.map,
  topics: state => state.topics,
  activeTopic: state => state.activeTopic,
  layers: state => state.layers,
  messages: state => state.messages,
  snackbar: state => state.messages.snackbar,
  currentTime: state => {
    const activeTopic = state.activeTopic;
    const topicName = state.topics[activeTopic].name;
    const topic = state.csvData[topicName];
    if (!topic) return '';
    const currentTimeIndex = state.currentTimeIndex;
    const time = Object.keys(topic.timeGrouped)[currentTimeIndex];
    console.log(time);
    return time;
  },
  persistentLayers: state => state.persistentLayers,
  postEditLayer: state => state.postEditLayer,
  lastSelectedLayer: state => state.lastSelectedLayer,
  csvData: state => state.csvData,
  currentTimeIndex: state => state.currentTimeIndex,
  getField
};

const mutations = {
  TOGGLE_SNACKBAR(state, payload) {
    Object.assign(state.messages.snackbar, payload);
  },
  SET_ACTIVE_TOPIC(state, topic) {
    state.activeTopic = topic;
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
  SET_CURRENT_TIME_INDEX(state, index) {
    this.currentTimeIndex = index;
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
