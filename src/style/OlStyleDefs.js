import OlStyle from 'ol/style/Style';
import OlStroke from 'ol/style/Stroke';
import OlFill from 'ol/style/Fill';
import OlCircle from 'ol/style/Circle';
import colormap from 'colormap';
import { getInterpolatedColor } from '../utils/Helpers';
import store from '../store/modules/map';


const steps = 50;
const ramp = colormap({
  colormap: 'jet',
  nshades: steps,
  format: 'rgbaString'
});

console.log(ramp.reverse());
const colors = {};
ramp.forEach((color, index) => {
  colors[index] = color;
});
console.log(colors);

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
  if (!topic) return []
  const time = Object.keys(topic.timeGrouped)[currentTimeIndex];
  const name = feature.get('name') ? feature.get('name').toUpperCase() : null;
  const value = topic.timeGrouped[time][name]
  if (!value) return []
  const color = getInterpolatedColor(topic.min, topic.max, parseInt(value), colors);
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
