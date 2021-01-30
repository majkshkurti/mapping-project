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
      name: 'spendings',
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
  popup: {
    title: 'Info',
    isVisible: false,
    popupOverlay: null,
    highlightLayer: null,
    activeFeature: null,
    activeLayer: null
  },
  layers: {}, // Only for operational layers
  colorMapEntities: {},
  csvData: {},
  currentTimeIndex: null,
  isPlaying: false,
  timeInterval: null,
  colors: {
    gdp: {
      '-Infinity>-30.001': 'rgb(101, 0, 53)',
      '-30>-25.001': 'rgb(136, 48, 87)',
      '-25>-20.001': 'rgb(171, 85, 125)',
      '-20>-15.001': 'rgb(196, 120, 155)',
      '-15>-10.001': 'rgb(219, 157, 184)',
      '-10>-5.001': 'rgb(234, 193, 206)',
      '-5>-0.001': 'rgb(245, 228, 225)',
      '0>4.999': 'rgb(230, 234, 213)',
      '5>9.9999': 'rgb(192, 211, 171)',
      '10>14.999': 'rgb(153, 184, 132)',
      '15>19.999': 'rgb(115, 154, 97)',
      '20>24.999': 'rgb(78, 123, 64)',
      '25>29.999': 'rgb(42, 90, 32)',
      '30>Infinity': 'rgb(0, 57, 1)'
    },
    unemployment: {
      '0>1.999': 'rgb(32, 102, 172)',
      '2>3.999': 'rgb(103, 169, 207)',
      '4>5.999': 'rgb(210, 228, 240)',
      '6>7.999': 'rgb(248, 246, 232)',
      '8>9.999': 'rgb(252, 220, 197)',
      '10>11.999': 'rgb(239, 138, 98)',
      '12>Infinity': 'rgb(239, 138, 98)'
    },
    spendings: {}
  }
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
    const activeTopic = state.activeTopic === 2 ? 0 : state.activeTopic;
    const topicName = state.topics[activeTopic].name;
    const topic = state.csvData[topicName];
    if (!topic) return '';
    const currentTimeIndex = state.currentTimeIndex;
    const time = Object.keys(topic.timeGrouped)[currentTimeIndex];
    return time;
  },
  persistentLayers: state => state.persistentLayers,
  postEditLayer: state => state.postEditLayer,
  lastSelectedLayer: state => state.lastSelectedLayer,
  csvData: state => state.csvData,
  currentTimeIndex: state => state.currentTimeIndex,
  colors: state => state.colors,
  popup: state => state.popup,
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
