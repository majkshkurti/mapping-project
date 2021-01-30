<script>
import { Line } from 'vue-chartjs';
import { mapGetters } from 'vuex';

export default {
  extends: Line,

  data() {
    return {
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: true
        },
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              },
              scaleLabel: {
                display: true,
                labelString: 'Value (%)'
              }
            }
          ],
          xAxes: [
            {
              ticks: {
                beginAtZero: true
              },
              scaleLabel: {
                display: true,
                labelString: 'Period'
              }
            }
          ]
        }
      }
    };
  },
  computed: {
    ...mapGetters('map', {
      previousMapPosition: 'previousMapPosition',
      popup: 'popup',
      activeTopic: 'activeTopic',
      currentYear: 'currentYear',
      topics: 'topics',
      csvData: 'csvData'
    }),
    topicName() {
      const topicName = this.topics[this.activeTopic].name;
      return topicName;
    }
  },
  watch: {
    'popup.activeFeature': function(feature) {
      const topic = this.csvData[this.topicName];
      const labels = Object.keys(topic.timeGrouped);
      const label = feature.get('name');
      const data = [];

      labels.forEach(label => {
        const value =
          topic.timeGrouped[label][feature.get('name').toUpperCase()];
        data.push(parseFloat(value));
      });
      this.init({
        label,
        labels,
        data
      });
    }
  },
  methods: {
    init(data) {
      this.renderLineChart(data);
    },
    renderLineChart: function(data) {
      this.renderChart(
        {
          labels: data.labels,
          datasets: [
            {
              label: data.label,
              data: data.data,
              backgroundColor: 'transparent',
              borderColor: '#FF6384',
              pointBackgroundColor: '#FF6384'
            }
          ]
        },
        this.options
      );
    }
  }
};
</script>
