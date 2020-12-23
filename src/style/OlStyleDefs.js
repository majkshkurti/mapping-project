import OlStyle from 'ol/style/Style';
import OlStroke from 'ol/style/Stroke';
import OlFill from 'ol/style/Fill';
import OlCircle from 'ol/style/Circle';

let strokeColor = 'rgba(236, 236, 236, 0.7)';
let fillColor = 'rgba(255,0,0, 0.2)';
let imageColor = 'blue';
let radiusHighlightColor = 'rgba(0,0,255,0.3)';
let zIndex = 100;

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

export function gdpStyle(feature) {
  // -25, -20 =>  #9e0e0e
  // - 20, -15 => #ca0020
  // -15, -10 => #fd1f1f
  // -10, -5 => #f75b5b
  // -5, 0 =>
  // 0, 5 =>  #1bff67
  const gdp = feature.get('GDP_2020');
  if (gdp > -25 && gdp < -20) {
    return new OlStyle({
      fill: new OlFill({
        color: '#9e0e0e' // semi-transparent red
      })
    });
  } else if (gdp > -20 && gdp < -15) {
    return new OlStyle({
      fill: new OlFill({
        color: '#ca0020' // semi-transparent red
      })
    });
  } else if (gdp > -15 && gdp < -10) {
    return new OlStyle({
      fill: new OlFill({
        color: '#fd1f1f' // semi-transparent red
      })
    });
  } else if (gdp > -10 && gdp < -5) {
    return new OlStyle({
      fill: new OlFill({
        color: '#f75b5b' // semi-transparent red
      })
    });
  } else if (gdp > 0 && gdp < 5) {
    return new OlStyle({
      fill: new OlFill({
        color: '#1bff67' // semi-transparent red
      })
    });
  } else if (gdp > 5 && gdp < 30) {
    return new OlStyle({
      fill: new OlFill({
        color: '#007810' // semi-transparent red
      })
    });
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

/**
 * Style used for popup selected feature highlight
 */

export function popupInfoStyle() {
  // MAJK: PopupInfo layer style (used for highlight)
  const styleFunction = () => {
    const styles = [];
    styles.push(
      new OlStyle({
        stroke: new OlStroke({
          color: strokeColor,
          width: 20
        }),
        zIndex: zIndex
      })
    );
    styles.push(
      new OlStyle({
        fill: new OlFill({
          color: fillColor
        }),
        stroke: new OlStroke({
          color: imageColor,
          width: 4
        }),
        image: new OlCircle({
          radius: 25,
          fill: new OlFill({
            color: radiusHighlightColor
          })
        }),
        zIndex: zIndex
      })
    );

    return styles;
  };
  return styleFunction;
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
