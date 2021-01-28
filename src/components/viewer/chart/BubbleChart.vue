<script>
import { Bubble } from 'vue-chartjs';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { mapGetters } from 'vuex';
import { EventBus } from '../../../EventBus';
// import { mapGetters } from "vuex";

export default {
  extends: Bubble,
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
        layout: {
          padding: {
            left: 20,
            right: 30,
            top: 40,
            bottom: 20
          }
        },
        plugins: {
          datalabels: {
            anchor: function(context) {
              var value = context.dataset.data[context.dataIndex].value;
              return parseFloat(value) < 5 ? 'end' : 'center';
            },
            align: function(context) {
              var value = context.dataset.data[context.dataIndex].value;
              return parseFloat(value) < 5 ? 'end' : 'center';
            },
            color: function(context) {
              var value = context.dataset.data[context.dataIndex].value;
              return parseFloat(value) < 5
                ? context.dataset.backgroundColor
                : 'white';
            },
            font: {
              weight: 'bold'
            },
            formatter: function(value) {
              return Math.round(parseFloat(value.value));
            },
            offset: 2,
            padding: 0
          }
        },
        scales: {
          yAxes: [
            {
              ticks: {
                display: false //this will remove only the label
              }
            }
          ],
          xAxes: [
            {
              ticks: {
                display: false //this will remove only the label
              },
              scaleLabel: {
                display: true
              }
            }
          ]
        },
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
              const dataset = data.datasets[tooltipItem.datasetIndex];
              if (dataset.data) {
                const spendings = `${dataset.label}: ${dataset.data[0].value} %`;
                return spendings;
              }
              return '';
            }
          }
        }
      }
    };
  },
  mounted() {
    this.addPlugin(ChartDataLabels);
    EventBus.$on('csvLoaded', this.init);
    this.init();
  },
  methods: {
    init() {
      const topic = this.topic;
      if (!topic) return;
      console.log(topic);
      // { data, labels, color: 'red' }
      const countries = Object.keys(topic.locationGrouped);
      const datasets = [];
      countries.forEach(country => {
        const obj = topic.locationGrouped[country][0];
        datasets.push({
          label: country,
          backgroundColor: 'rgba(255, 99, 71, 0.5)',
          pointBackgroundColor: 'white',
          borderWidth: 1,
          pointBorderColor: '#249EBF',
          data: [
            {
              value: obj.spendings,
              x: parseFloat(obj.longitude),
              y: parseFloat(obj.latitude),
              r:
                parseFloat(obj.spendings) * 2 < 5
                  ? 5
                  : parseFloat(obj.spendings) * 2
            }
          ]
        });
      });
      this.renderBubbleChart(datasets);
    },
    renderBubbleChart: function(datasets) {
      console.log(datasets);
      this.renderChart(
        {
          labels: 'Spendings',
          datasets: datasets
        },
        this.options
      );
    }
  },
  watch: {
    activeTopic() {
      this.init();
    }
  }
};
</script>
