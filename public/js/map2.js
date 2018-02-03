mapboxgl.accessToken = 'pk.eyJ1IjoiZWxnZWxibyIsImEiOiJjajRlNXB6dzQwc3FyMzJuaHMwaGo0bTVmIn0.1zglQ_bZTA-DsJ4PJkLAQw';
var map = new mapboxgl.Map({
  container: "map", // container id
  style: "mapbox://styles/mapbox/satellite-v9", //hosted style id
  center: [-91.874, 42.76], // starting position
  zoom: 12 // starting zoom
});

var draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    polygon: true,
    trash: true
  },
  styles: [
    {
      'id': 'gl-draw-polygon-fill-inactive',
      'type': 'fill',
      'filter': ['all',
        ['==', 'active', 'false'],
        ['==', '$type', 'Polygon'],
        ['!=', 'mode', 'static']
      ],
      'layout': {
        'visibility': 'visible'
      },
      'paint': {
        'fill-color': '#3bb2d0',
        'fill-outline-color': '#3bb2d0',
        'fill-opacity': 0.1
      }
    },
    {
      'id': 'gl-draw-polygon-fill-active',
      'type': 'fill',
      'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
      'paint': {
        'fill-color': '#fbb03b',
        'fill-outline-color': '#fbb03b',
        'fill-opacity': 0.1
      }
    },
    {
      'id': 'gl-draw-polygon-midpoint',
      'type': 'circle',
      'filter': ['all',
        ['==', '$type', 'Point'],
        ['==', 'meta', 'midpoint']],
      'paint': {
        'circle-radius': 3,
        'circle-color': '#fbb03b'
      }
    },
    {
      'id': 'gl-draw-polygon-stroke-inactive',
      'type': 'line',
      'filter': ['all',
        ['==', 'active', 'false'],
        ['==', '$type', 'Polygon'],
        ['!=', 'mode', 'static']
      ],
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': '#3bb2d0',
        'line-width': 2
      }
    },
    {
      'id': 'gl-draw-polygon-stroke-active',
      'type': 'line',
      'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': '#fbb03b',
        'line-dasharray': [0.2, 2],
        'line-width': 2
      }
    },
    {
      'id': 'gl-draw-line-inactive',
      'type': 'line',
      'filter': ['all',
        ['==', 'active', 'false'],
        ['==', '$type', 'LineString'],
        ['!=', 'mode', 'static']
      ],
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': '#3bb2d0',
        'line-width': 2
      }
    },
    {
      'id': 'gl-draw-line-active',
      'type': 'line',
      'filter': ['all',
        ['==', '$type', 'LineString'],
        ['==', 'active', 'true']
      ],
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': '#fbb03b',
        'line-dasharray': [0.2, 2],
        'line-width': 2
      }
    },
    {
      'id': 'gl-draw-polygon-and-line-vertex-stroke-inactive',
      'type': 'circle',
      'filter': ['all',
        ['==', 'meta', 'vertex'],
        ['==', '$type', 'Point'],
        ['!=', 'mode', 'static']
      ],
      'paint': {
        'circle-radius': 5,
        'circle-color': '#fff'
      }
    },
    {
      'id': 'gl-draw-polygon-and-line-vertex-inactive',
      'type': 'circle',
      'filter': ['all',
        ['==', 'meta', 'vertex'],
        ['==', '$type', 'Point'],
        ['!=', 'mode', 'static']
      ],
      'paint': {
        'circle-radius': 3,
        'circle-color': '#fbb03b'
      }
    },
    {
      'id': 'gl-draw-point-point-stroke-inactive',
      'type': 'circle',
      'filter': ['all',
        ['==', 'active', 'false'],
        ['==', '$type', 'Point'],
        ['==', 'meta', 'feature'],
        ['!=', 'mode', 'static']
      ],
      'paint': {
        'circle-radius': 5,
        'circle-opacity': 1,
        'circle-color': '#fff'
      }
    },
    {
      'id': 'gl-draw-point-inactive',
      'type': 'circle',
      'filter': ['all',
        ['==', 'active', 'false'],
        ['==', '$type', 'Point'],
        ['==', 'meta', 'feature'],
        ['!=', 'mode', 'static']
      ],
      'paint': {
        'circle-radius': 3,
        'circle-color': '#3bb2d0'
      }
    },
    {
      'id': 'gl-draw-point-stroke-active',
      'type': 'circle',
      'filter': ['all',
        ['==', '$type', 'Point'],
        ['==', 'active', 'true'],
        ['!=', 'meta', 'midpoint']
      ],
      'paint': {
        'circle-radius': 7,
        'circle-color': '#fff'
      }
    },
    {
      'id': 'gl-draw-point-active',
      'type': 'circle',
      'filter': ['all',
        ['==', '$type', 'Point'],
        ['!=', 'meta', 'midpoint'],
        ['==', 'active', 'true']],
      'paint': {
        'circle-radius': 5,
        'circle-color': '#fbb03b'
      }
    },
    {
      'id': 'gl-draw-polygon-fill-static',
      'type': 'fill',
      'filter': ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
      'paint': {
        'fill-color': '#404040',
        'fill-outline-color': '#404040',
        'fill-opacity': 0.1
      }
    },
    {
      'id': 'gl-draw-polygon-stroke-static',
      'type': 'line',
      'filter': ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': '#404040',
        'line-width': 2
      }
    },
    {
      'id': 'gl-draw-line-static',
      'type': 'line',
      'filter': ['all', ['==', 'mode', 'static'], ['==', '$type', 'LineString']],
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': '#404040',
        'line-width': 2
      }
    },
    {
      'id': 'gl-draw-point-static',
      'type': 'circle',
      'filter': ['all', ['==', 'mode', 'static'], ['==', '$type', 'Point']],
      'paint': {
        'circle-radius': 5,
        'circle-color': '#404040'
      }
    }
  ]
});
map.addControl(draw);

map.on('load', function() {
  var mapGeo = document.getElementById("geometry").value;
  if (!mapGeo) {
    return;
  } else {
    var mapData = JSON.parse(mapGeo);
    draw.add(mapData);
    });
  }
});

map.on("draw.create", updateMap);
map.on("draw.delete", updateMap);
map.on("draw.update", updateMap);
//
function updateMap() {
  var data = draw.getAll();
  for (i = 0; i < data.features.length; i++) {
    draw.setFeatureProperty(data.features[i].id, 'yes', 'yes');
  }
  var convertedData = JSON.stringify(draw.getAll());
  document.getElementById("geometry").setAttribute("value", convertedData);
}


function myFunction(c) {
  var visibility = map.getLayoutProperty(c, 'visibility');
  if (visibility === 'visible') {
    map.setLayoutProperty(c, 'visibility', 'none');
  } else {
    map.setLayoutProperty(c, 'visibility', 'visible');
  }
}

// document.getElementById("4243e93e8869ce62056d18a9cf08b627").addEventListener("click", myFunction);
// function myFunction() {
//   var layer = draw.getMode();
//   // var mys = draw.getSource("4243e93e8869ce62056d18a9cf08b627")
//   // var layer = draw.get("4243e93e8869ce62056d18a9cf08b627");
//   console.log(layer);
//   // map.setPaintProperty('chicago', 'raster-opacity', parseInt(e.target.value, 10) / 100);
//   // var info = draw.setFeatureProperty(layer.id, 'display', true);
// }
