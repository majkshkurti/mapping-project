export function humanize(str) {
  return str
    .replace(/^[\s_]+|[\s_]+$/g, '')
    .replace(/[_\s]+/g, ' ')
    .replace(/^[a-z]/, function(m) {
      return m.toUpperCase();
    });
}

export function groupBy(items, key) {
  return items.reduce(
    (result, item) => ({
      ...result,
      [item[key]]: [...(result[item[key]] || []), item]
    }),
    {}
  );
}

export function parseVideoUrl(url) {
  let formattedUrl;

  // FORMAT VIMEO VIDEO URL
  if (
    url.includes('https://player.vimeo.com') ||
    url.includes('https://www.youtube-nocookie.com')
  ) {
    formattedUrl = url;
  }
  if (url.includes('https://vimeo.com/')) {
    const videoId = url.split('https://vimeo.com/')[1];
    formattedUrl = 'https://player.vimeo.com/video/' + videoId;
  }
  // FORMAT YOUTUBE VIDEO URL
  if (url.includes('https://www.youtube.com/watch?v=')) {
    let videoId = url.split('https://www.youtube.com/watch?v=')[1];
    let ampersandPosition = videoId.indexOf('&');
    if (ampersandPosition != -1) {
      videoId = videoId.substring(0, ampersandPosition);
    }
    formattedUrl = 'https://www.youtube-nocookie.com/embed/' + videoId;
  }
  return formattedUrl;
}

export function getNestedProperty(obj, key) {
  return key.split('.').reduce(function(o, x) {
    return typeof o === 'undefined' || o === null ? o : o[x];
  }, obj);
}

export function addProps(obj, arr, val) {
  if (typeof arr === 'string') arr = arr.split('.');

  obj[arr[0]] = obj[arr[0]] || {};

  var tmpObj = obj[arr[0]];

  if (arr.length > 1) {
    arr.shift();
    addProps(tmpObj, arr, val);
  } else obj[arr[0]] = val;

  return obj;
}

export function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function debounce(fn, delay) {
  let timeoutID = null;
  return function() {
    clearTimeout(timeoutID);
    let args = arguments;
    let that = this;
    timeoutID = setTimeout(function() {
      fn.apply(that, args);
    }, delay);
  };
}

/*
    reshapes the data from the second accepted csv format to the other :
    (one row per contender and per date) => (one row per date (ordered) and one column per contender.)
    */

export function reshapeData(data) {
  // groupby dates (first column)
  let column_names = new Set(data.map(x => x[Object.keys(x)[1]]));
  const grouped_by_date = groupBy(data, 'date');
  return Object.keys(grouped_by_date).map(k => {
    const item = { date: k };
    column_names.forEach(n => (item[n] = 0));
    grouped_by_date[k].forEach(
      e => (item[e[Object.keys(e)[1]]] = e[Object.keys(e)[2]])
    );
    return item;
  });
}

export function getCurrentDate() {
  const today = new Date();
  return (
    today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
  );
}

export function getCurrentTime() {
  const today = new Date();
  return today.getHours() + '-' + today.getMinutes() + '-' + today.getSeconds();
}

/**
 * Takes a hex value and prepends a zero if it's a single digit.
 * @param {string} hex Hex value to prepend if single digit.
 * @return {string} hex value prepended with zero if it was single digit,
 *     otherwise the same value that was passed in.
 * @hidden
 */
export function colorZeroPadding(hex) {
  return hex.length === 1 ? `0${hex}` : hex;
}

/**
 * Converts a color from RGB to hex representation.
 * @param {number[]} rgb rgb representation of the color.
 * @return {string} hex representation of the color.
 * @hidden
 */
export function rgbArrayToHex(rgb) {
  const r = rgb[0];
  const g = rgb[1];
  const b = rgb[2];
  if (r !== (r & 255) || g !== (g & 255) || b !== (b & 255)) {
    throw Error(`"(${r},${g},${b})" is not a valid RGB color`);
  }
  const hexR = colorZeroPadding(r.toString(16));
  const hexG = colorZeroPadding(g.toString(16));
  const hexB = colorZeroPadding(b.toString(16));
  return `#${hexR}${hexG}${hexB}`;
}

// helper function to detect a CSS color
// Taken from Vuetify sources
// https://github.com/vuetifyjs/vuetify/blob/master/packages/vuetify/src/mixins/colorable.ts
export function isCssColor(color) {
  return !!color && !!color.match(/^(#|(rgb|hsl)a?\()/);
}

// Returns two closest values from the array. If value exist undefined is returned
export function getClosest(a, x) {
  var min = Math.min.apply(null, a),
    max = Math.max.apply(null, a),
    i,
    len;

  if (x < min) {
    // if x is lower than the lowest value
    return min;
  } else if (x > max) {
    // if x is greater than the 'greatest' value
    return max;
  }
  a.sort();
  for (i = 0, len = a.length; i < len; i++) {
    if (x > a[i] && x < a[i + 1]) {
      return [a[i], a[i + 1]];
    }
  }
}

// Returns a single rgb color interpolation between given rgb color
// based on the factor given; via https://codepen.io/njmcode/pen/axoyD?editors=0010
export function interpolateColor(color1, color2, factor) {
  if (arguments.length < 3) {
    factor = 0.5;
  }
  color1 = color1.match(/\d+/g).map(Number);
  color2 = color2.match(/\d+/g).map(Number);
  var result = color1.slice();
  for (var i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
  }
  return `rgb(${result.toString()})`;
}

export function linearInterpolation(x1, x2, y1, y2, x) {
  return (x - x1) * ((y2 - y1) / (x2 - x1)) + y1;
}

export function getInterpolatedColor(lowestValue, highestValue, value, color) {
  const colorKeys = Object.keys(color).map(n => parseInt(n, 10));
  //====//
  // x1 lowest step value TODO: get this dynamically from the options
  // x2 highest step value  TODO: get this dynamically from the options
  // y1 lowest color key code
  // y2 highest color key code
  // x current step value
  // Interpolates step values down to color key length
  const interpolatedValue = linearInterpolation(
    lowestValue,
    highestValue,
    colorKeys[0],
    [...colorKeys].pop(),
    value // isochrone step or cost
  );
  let interpolatedColor;
  // Find if the interpolated value exists in colors key, if not find two closest values.
  if (colorKeys.includes(interpolatedValue)) {
    // No interpolation
    interpolatedColor = color[interpolatedValue];
  } else {
    // Interpolate using factor
    const closestKeys = getClosest(colorKeys, interpolatedValue); //ex [3,4] color object keys
    const lowerColor = color[closestKeys[0]];
    const upperColor = color[closestKeys[1]];
    const factor = interpolatedValue - closestKeys[0]; // factor goes from 0 => 1
    interpolatedColor = interpolateColor(lowerColor, upperColor, factor);
  }
  return interpolatedColor;
}
