<script>
import { HorizontalBar } from 'vue-chartjs';
import { mapGetters } from 'vuex';
import { EventBus } from '../../../EventBus';
// import { mapGetters } from "vuex";

export default {
  extends: HorizontalBar,
  computed: {
    ...mapGetters('map', {
      csvData: 'csvData',
      topics: 'topics',
      activeTopic: 'activeTopic',
      colors: 'colors',
      currentTimeIndex: 'currentTimeIndex'
    }),
    topic() {
      const topicName = this.topics[this.topicIndex].name;

      return this.csvData[topicName];
    }
  },
  props: {
    topicIndex: { type: Number, required: true }
  },
  data() {
    return {
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false
        },
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ],
          xAxes: [
            {
              ticks: {
                beginAtZero: true
              },
              scaleLabel: {
                display: true
              }
            }
          ]
        }
      }
    };
  },
  mounted() {
    EventBus.$on('csvLoaded', this.init);
    this.init();
  },
  methods: {
    init() {
      const topic = this.topic;
      if (!topic) return;
      const times = Object.keys(topic.timeGrouped);
      const key = times[this.currentTimeIndex];
      if (key) {
        const values = topic.timeGrouped[key];
        const colorsArray = [];
        const data = [];
        const labels = [];
        // const colors = []
        Object.keys(values).forEach(value => {
          if (value !== 'date') {
            labels.push(value);
            data.push(parseFloat(values[value]));

            const valueRounded = parseFloat(values[value]);
            const topicName = this.topics[this.topicIndex].name;
            let color = '';
            const colors = this.colors[topicName];
            console.log(colors);
            Object.keys(colors).forEach(key => {
              const keyNr = key.split('>').map(x => +x);
              if (valueRounded >= keyNr[0] && valueRounded <= keyNr[1]) {
                color = colors[key];
              }
            });
            colorsArray.push(color);
            console.log(colors);
          }
        });
        this.renderBarChart({ data, labels, color: colorsArray });
      }
    },
    renderBarChart: function(data) {
      this.renderChart(
        {
          labels: data.labels,
          datasets: [
            {
              label: '',
              backgroundColor: data.color,
              data: data.data
            }
          ]
        },
        this.options
      );
    }
  },
  watch: {
    activeTopic() {
      this.init();
    },
    currentTimeIndex() {
      this.init();
    }
  }
};
</script>
