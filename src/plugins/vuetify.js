import '@fortawesome/fontawesome-free/css/all.css'; // Ensure you are using css-loader
import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

const vuetify = new Vuetify({
  icons: {
    iconfont: 'md' // default - only for display purposes
  }
});

Vue.use({
  vuetify,
  iconsGroup: 'md'
});

export default vuetify;
