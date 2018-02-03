mapboxgl.accessToken = 'pk.eyJ1IjoiZWxnZWxibyIsImEiOiJjajRlNXB6dzQwc3FyMzJuaHMwaGo0bTVmIn0.1zglQ_bZTA-DsJ4PJkLAQw';
var map = new mapboxgl.Map({
  container: "map", // container id
  style: "mapbox://styles/mapbox/satellite-v9", //hosted style id
  center: [-91.874, 42.76], // starting position
  zoom: 12 // starting zoom
});

var mapGeo = document.getElementById("geometry").value;
var mapData = JSON.parse(mapGeo);

map.on("load", function() {
  if (!mapGeo) {
    return;
  } else {
    mapData.features.forEach(function(element) {
      map.addSource(element.id, {
        "type": "geojson",
        "data": element
      });
      console.log(element);
      map.addLayer({
        "id": element.id,
        "type": "fill",
        "source": element.id,
        'layout': {
          'visibility': 'visible'
        },
        "paint": {
          "fill-color": "#888888",
          "fill-opacity": 0.4
        },
        "filter": ["==", "$type", "Polygon"]
      });
      document.getElementById(element.id).addEventListener("click", function() {
        myFunction(element.id);
      });
      map.on('click', element.id, function(e) {
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(e.features[0].geometry.type)
          .addTo(map);
      });
    });
  }
});

function myFunction(c) {
  var visibility = map.getLayoutProperty(c, 'visibility');
  if (visibility === 'visible') {
    map.setLayoutProperty(c, 'visibility', 'none');
  } else {
    map.setLayoutProperty(c, 'visibility', 'visible');
  }
}
