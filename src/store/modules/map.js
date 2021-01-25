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
  timeInterval: null,
  colors: {
    gdp: {
      '-Infinity>-30': 'rgb(111, 30, 72)',
      '-29>-21': 'rgb(139, 62, 99)',
      '-20>-15': 'rgb(165, 95, 127)',
      '-14>-10': 'rgb(193, 129, 156)',
      '-9>-6': 'rgb(209, 162, 179)',
      '-5>-3': 'rgb(228, 194, 202)',
      '-2>0': 'rgb(243, 229, 222)',
      '1>2': 'rgb(230, 234, 215)',
      '3>5': 'rgb(195, 209, 180)',
      '6>9': 'rgb(160, 183, 145)',
      '10>14': 'rgb(124, 156, 110)',
      '15>20': 'rgb(90, 126, 81)',
      '21>29': 'rgb(59, 99, 50)',
      '30>Infinity': 'rgb(26, 70, 24)'
    },
    unemployment: {
      '0>1': 'rgb(254, 235, 226)',
      '2>3': 'rgb(253, 208, 202)',
      '4>5': 'rgb(251, 181, 187)',
      '6>7': 'rgb(250, 152, 178)',
      '8>9': 'rgb(248, 113, 164)',
      '10>11': 'rgb(248, 113, 164)',
      '12>13': 'rgb(175, 19, 133)',
      '14>Infinity': 'rgb(122, 1, 119)'
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
    const activeTopic = state.activeTopic;
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
