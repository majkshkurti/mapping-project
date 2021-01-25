<template>
  <div id="barChartDiv" class="ma-2" style="width:100%; height: 400px"></div>
</template>

<script>
import { mapGetters } from 'vuex';
import { mapFields } from 'vuex-map-fields';
import * as d3 from 'd3';
import { EventBus } from '../../EventBus';

export default {
  data() {
    return {
      isIframeLoading: true,
      duration: 20,
      top_n: 10, // Number of bars
      tickDuration: 500
    };
  },
  computed: {
    ...mapGetters('map', {
      map: 'map',
      csvData: 'csvData',
      topics: 'topics',
      activeTopic: 'activeTopic',
      colors: 'colors'
    }),
    ...mapGetters('app', {
      sidebarHtml: 'sidebarHtml',
      postIcons: 'postIcons'
    }),
    ...mapFields('map', {
      popup: 'popup',
      layers: 'layers'
    })
  },
  methods: {
    startChartRace() {
      var self = this;
      const topic = self.topics[0].name;
      const csv_data = self.csvData[topic].values;

      if (self.interval) {
        self.interval.stop();
      }
      if (!csv_data) {
        return;
      }
      if (self.tickDuration && self.top_n) {
        this.top_n = parseInt(self.top_n);
        this.duration = parseInt(
          Object.keys(self.csvData[topic].timeGrouped).length
        );
        this.tickDuration = 1000;
        var data = JSON.parse(JSON.stringify(csv_data));
        self.interval = this.createBarChartRace(
          data,
          self.top_n,
          self.tickDuration
        );
      }

      self.errors = [];

      if (!self.tickDuration) {
        self.errors.push('Time between frames required.');
      }
      if (!self.top_n) {
        self.errors.push('Number of bars to display required.');
      }
    },
    stopChartRace() {
      if (!this.interval) {
        return;
      } else {
        this.interval.stop();
      }
    },
    createBarChartRace(data, top_n, tickDuration) {
      const self = this;
      let chartDiv = document.getElementById('barChartDiv');
      chartDiv.textContent = '';
      let width = chartDiv.clientWidth;
      let height = chartDiv.clientHeight - 50;

      let svg = d3
        .select(chartDiv)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

      let timeline_svg = d3
        .select(chartDiv)
        .append('svg')
        .attr('width', width)
        .attr('height', 50);

      const margin = {
        top: 20,
        right: 30,
        bottom: 0,
        left: 0
      };

      const marginTimeAxis = 30;
      let barPadding = (height - (margin.bottom + margin.top)) / (top_n * 5);
      const time_index = d3.keys(data[0])[0];
      const column_names = d3.keys(data[0]).slice(1);
      // define a random color for each column
      const colors = {};
      const color_scale = d3.scaleOrdinal(d3.schemeSet3);
      column_names.forEach((name, i) => {
        colors[name] = color_scale(i);
      });
      // Parse data
      data.forEach(d => {
        // first column : YYYY-MM-DD
        const parseTime = d3.timeParse('%d/%m/%Y');
        d[time_index] = parseTime(d[time_index]);
        // convert other columns to numbers
        column_names.forEach(k => (d[k] = Number(d[k])));
      });

      // eslint-disable-next-line no-undef
      const rowData = this.getRowData(data, column_names, 0, this.top_n);
      this.time = rowData[0];
      this.row_data = rowData[1];

      this.start_date = d3.min(data, d => d[time_index]);
      this.end_date = d3.max(data, d => d[time_index]);

      let t = d3
        .scaleTime()
        .domain([this.start_date, this.end_date])
        .range([margin.left + marginTimeAxis, width - margin.right]);

      let timeAxis = d3
        .axisBottom()
        .ticks(5)
        .scale(t);

      let x = d3
        .scaleLinear()
        .domain([0, d3.max(this.row_data, d => d.value)])
        .range([margin.left, width - margin.right]);

      let y = d3
        .scaleLinear()
        .domain([top_n, 0])
        .range([height - margin.bottom, margin.top]);

      let xAxis = d3
        .axisTop()
        .scale(x)
        .ticks(5)
        .tickSize(-(height - margin.top - margin.bottom))
        .tickFormat(d => d3.format(',')(d));

      svg
        .append('g')
        .attr('class', 'axis xAxis')
        .attr('transform', `translate(0, ${margin.top})`)
        .call(xAxis)
        .selectAll('.tick line')
        .classed('origin', d => d === 0);

      svg
        .selectAll('rect.bar')
        .data(this.row_data, d => d.name)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', x(0) + 1)
        .attr('width', d => x(d.value) - x(0))
        .attr('y', d => y(d.rank) + barPadding / 2)
        .attr('height', y(1) - y(0) - barPadding)
        .style('fill', d => colors[d.name]);

      svg
        .selectAll('text.label')
        .data(this.row_data, d => d.name)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => x(d.value) - 8)
        .attr('y', d => y(d.rank) + (y(1) - y(0)) / 2 + 1)
        .style('text-anchor', 'end')
        .html(d => d.name);

      svg
        .selectAll('text.valueLabel')
        .data(this.row_data, d => d.name)
        .enter()
        .append('text')
        .attr('class', 'valueLabel')
        .attr('x', d => x(d.value) + 5)
        .attr('y', d => y(d.rank) + (y(1) - y(0)) / 2 + 1)
        .text(d => d3.format(',.0f')(d.lastValue));

      // svg.append('rect')
      //     .attr('y', height - margin.bottom)
      //     .attr('width', width)
      //     .attr('height', margin.bottom)
      //     .style('fill', '#ffffff')

      timeline_svg
        .append('g')
        .attr('class', 'axis tAxis')
        .attr('transform', `translate(0, 20)`)
        .call(timeAxis);

      timeline_svg
        .append('rect')
        .attr('class', 'progressBar')
        .attr('transform', `translate(${marginTimeAxis}, 20)`)
        .attr('height', 2)
        .attr('width', 0);

      let timeText = svg
        .append('text')
        .attr('class', 'timeText')
        .attr('x', width - margin.right)
        .attr('y', height - margin.bottom - 5)
        .style('text-anchor', 'end')
        .html(d3.timeFormat('%B %d, %Y')(this.time));

      // draw the updated graph with transitions
      function drawGraph() {
        // update xAxis with new domain
        x.domain([0, d3.max(self.row_data, d => d.value)]);

        svg
          .select('.xAxis')
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .call(xAxis);

        // update bars
        let bars = svg.selectAll('.bar').data(self.row_data, d => d.name);

        bars
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('x', x(0) + 1)
          .attr('width', d => x(d.value) - x(0))
          //enter from out of screen
          // eslint-disable-next-line no-unused-vars
          .attr('y', d => y(top_n + 1) + 0)
          .attr('height', y(1) - y(0) - barPadding)
          .style('fill', d => colors[d.name])
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('y', d => y(d.rank) + barPadding / 2);

        bars
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('width', d => x(d.value) - x(0))
          .attr('y', d => y(d.rank) + barPadding / 2);

        bars
          .exit()
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('width', d => x(d.value) - x(0))
          // eslint-disable-next-line no-unused-vars
          .attr('y', d => y(top_n + 1) + barPadding / 2)
          .remove();

        // update labels
        let labels = svg.selectAll('.label').data(self.row_data, d => d.name);

        labels
          .enter()
          .append('text')
          .attr('class', 'label')
          .attr('x', d => x(d.value) - 8)
          // eslint-disable-next-line no-unused-vars
          .attr('y', d => y(top_n + 1) + (y(1) - y(0)) / 2)
          .style('text-anchor', 'end')
          .html(d => d.name)
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('y', d => y(d.rank) + (y(1) - y(0)) / 2 + 1);

        labels
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('x', d => x(d.value) - 8)
          .attr('y', d => y(d.rank) + (y(1) - y(0)) / 2 + 1);

        labels
          .exit()
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('x', d => x(d.value) - 8)
          // eslint-disable-next-line no-unused-vars
          .attr('y', d => y(top_n + 1))
          .remove();

        // update value labels

        let valueLabels = svg
          .selectAll('.valueLabel')
          .data(self.row_data, d => d.name);

        valueLabels
          .enter()
          .append('text')
          .attr('class', 'valueLabel')
          .attr('x', d => x(d.value) + 5)
          // eslint-disable-next-line no-unused-vars
          .attr('y', d => y(top_n + 1))
          .text(d => d3.format(',.0f')(d.lastValue))
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('y', d => y(d.rank) + (y(1) - y(0)) / 2 + 1);

        valueLabels
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('x', d => x(d.value) + 5)
          .attr('y', d => y(d.rank) + (y(1) - y(0)) / 2 + 1)
          .tween('text', function(d) {
            let i = d3.interpolateNumber(d.lastValue, d.value);
            return function(t) {
              this.textContent = d3.format(',.0f')(i(t));
            };
          });

        valueLabels
          .exit()
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('x', d => x(d.value) + 5)
          // eslint-disable-next-line no-unused-vars
          .attr('y', d => y(top_n + 1))
          .remove();

        // update time label and progress bar
        d3.select('.progressBar')
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('width', t(self.time) - marginTimeAxis);
        // .on('end', () => {
        //     d3.select('.timeText').html(d3.timeFormat("%B %d, %Y")(time))
        // timeText.html(d3.timeFormat("%B %d, %Y")(time))
        // })
        timeText.html(d3.timeFormat('%B %d, %Y')(self.time));
      }

      // loop
      let i = 1;
      // eslint-disable-next-line no-unused-vars
      let interval = d3.interval(e => {
        [self.time, self.row_data] = this.getRowData(data, column_names, i);
        drawGraph();
        // increment loop
        i += 1;
        if (i == data.length) interval.stop();
      }, tickDuration);
      return interval;
    },
    getRowData(data, column_names, row_index, top_n) {
      const row = data[row_index];
      let new_data = column_names.map(name => {
        return { name: name, value: row[name] };
      });
      new_data = new_data.sort((a, b) => b.value - a.value).slice(0, top_n);
      new_data.forEach((d, i) => {
        d.rank = i;
        d.lastValue = row_index > 0 ? data[row_index - 1][d.name] : d.value;
      });
      return [row[d3.keys(row)[0]], new_data];
    }
  },
  created() {
    EventBus.$on('play', () => {
      this.startChartRace();
    });
    EventBus.$on('stop', () => {
      this.stopChartRace();
    });
  }
};
</script>

<style></style>
