import OlStyle from 'ol/style/Style';
import OlStroke from 'ol/style/Stroke';
import OlFill from 'ol/style/Fill';
import OlCircle from 'ol/style/Circle';
// import colormap from 'colormap';
import store from '../store/modules/map';

const colors = {
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
  const valueRounded = parseInt(value, 10);
  console.log(valueRounded);
  let color = '';
  Object.keys(colors).forEach(key => {
    const keyNr = key.split('>').map(x => +x);
    if (valueRounded >= keyNr[0] && valueRounded <= keyNr[1]) {
      color = colors[key];
    }
  });
  console.log(color);
  if (value) {
    return new OlStyle({
      fill: new OlFill({
        color: color // semi-transparent red
      }),
      stroke: new OlStroke({
        color: color,
        width: 1
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
