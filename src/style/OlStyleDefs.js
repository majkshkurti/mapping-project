import OlStyle from 'ol/style/Style';
import OlStroke from 'ol/style/Stroke';
import OlFill from 'ol/style/Fill';
import OlCircle from 'ol/style/Circle';
// import colormap from 'colormap';
import OlPoint from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';

import store from '../store/modules/map';

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
  if (topicName !== 'spendings') {
    const time = Object.keys(topic.timeGrouped)[currentTimeIndex];
    const name = feature.get('name') ? feature.get('name').toUpperCase() : null;
    const value = topic.timeGrouped[time][name];
    if (!value) return [];
    const valueRounded = parseFloat(value);
    let color = '';
    const _colors = store.state.colors[topicName];
    Object.keys(_colors).forEach(key => {
      const keyNr = key.split('>').map(x => +x);
      if (valueRounded >= keyNr[0] && valueRounded <= keyNr[1]) {
        color = _colors[key];
      }
    });
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
  } else {
    console.log(feature);
    console.log(topic);
    if (topic.locationGrouped[feature.get('name')]) {
      const value = parseInt(
        topic.locationGrouped[feature.get('name')][0].spendings
      );
      let radius = value * 3;
      if (radius < 10) {
        radius = 10;
      }
      if (radius > 40) {
        radius = 40;
      }
      console.log(value);
      return new OlStyle({
        image: new OlCircle({
          radius: radius,
          fill: new OlFill({
            color: 'rgba(255, 99, 71, 0.5)'
          })
        }),
        geometry: function(feature) {
          console.log(feature);
          const lon = feature.get('lon');
          const lat = feature.get('lat');
          // return the coordinates of the center of polygon
          if (lon && lat) {
            const center = fromLonLat([parseFloat(lon), parseFloat(lat)]);
            return new OlPoint(center);
          }
        }
      });
    } else {
      return [];
    }
  }
}

export function getFeatureHighlightStyle() {
  return [
    new OlStyle({
      fill: new OlFill({
        color: 'rgba(255, 0, 0, 0.7)'
      }),
      stroke: new OlStroke({
        color: 'rgba(255, 0, 0, 0.7)',
        width: 4
      }),
      image: new OlCircle({
        radius: 4,
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
