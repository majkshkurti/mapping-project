import OlStyle from 'ol/style/Style';
import OlStroke from 'ol/style/Stroke';
import OlFill from 'ol/style/Fill';
import OlCircle from 'ol/style/Circle';
// import colormap from 'colormap';
import { getInterpolatedColor } from '../utils/Helpers';
import store from '../store/modules/map';

const colors = {
  '-30': 'rgb(202, 36, 39)',
  '-25': 'rgb(230, 80, 54)',
  '-15': 'rgb(247, 129, 76)',
  '-10': 'rgb(253, 177, 99)',
  '-5': 'rgb(254, 216, 132)',
  '0': 'rgb(255, 243, 172)',
  '5': 'rgb(241, 249, 172)',
  '10': 'rgb(209, 236, 134)',
  '15': 'rgb(169, 218, 108)',
  '20': 'rgb(122, 198, 101)',
  '25': 'rgb(66, 172, 90)',
  '30': 'rgb(19, 140, 74)'
};

export function defaultStyle(feature) {
  const geomType = feature.getGeometry().getType();
  const style = new OlStyle({
    fill: new OlFill({
      color: ['MultiPolygon', 'Polygon'].includes(geomType)
        ? '#FF0000'
        : [0, 0, 0, 0]
    }),
    stroke: new OlStroke({
      color: ['MultiPolygon', 'Polygon'].includes(geomType)
        ? '#FF0000'
        : '#FF0000',
      width: 3
    }),
    image: new OlCircle({
      radius: 7,
      fill: new OlFill({
        color: '#FF0000'
      })
    })
  });
  return [style];
}

export function mainStyle(feature) {
  const activeTopic = store.state.activeTopic;
  const topicName = store.state.topics[activeTopic].name;
  const topic = store.state.csvData[topicName];
  const currentTimeIndex = store.state.currentTimeIndex;
  if (!topic) return [];
  const time = Object.keys(topic.timeGrouped)[currentTimeIndex];
  const name = feature.get('name') ? feature.get('name').toUpperCase() : null;
  const value = topic.timeGrouped[time][name];
  if (!value) return [];
  const color = getInterpolatedColor(
    topic.min,
    topic.max,
    parseInt(value),
    colors
  );
  if (value) {
    return new OlStyle({
      fill: new OlFill({
        color: color // semi-transparent red
      })
    });
  } else {
    return [];
  }
}

export function getFeatureHighlightStyle() {
  return [
    new OlStyle({
      fill: new OlFill({
        color: [0, 0, 0, 0]
      }),
      stroke: new OlStroke({
        color: '#FF0000',
        width: 10
      }),
      image: new OlCircle({
        radius: 10,
        fill: new OlFill({
          color: '#FF0000'
        })
      })
    })
  ];
}

export const baseStyleDefs = {
  boundaryStyle: () => {
    return new OlStyle({
      fill: new OlFill({
        color: [0, 0, 0, 0]
      }),
      stroke: new OlStroke({
        color: '#707070',
        width: 5.5
      })
    });
  }
};
