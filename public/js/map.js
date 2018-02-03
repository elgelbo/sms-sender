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
  }
});
map.addControl(draw);

map.on('load', function() {
  var mapGeo = document.getElementById("geometry").value;
  if (!mapGeo) {
    return;
  } else {
    draw.add(JSON.parse(mapGeo));
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
map.on("MODE.toDisplayFeatures", myFunction());


document.getElementById("4243e93e8869ce62056d18a9cf08b627").addEventListener("click", myFunction);
function myFunction() {
  var layer = draw.getMode();
  // var mys = draw.getSource("4243e93e8869ce62056d18a9cf08b627")
  // var layer = draw.get("4243e93e8869ce62056d18a9cf08b627");
  console.log(layer);
  // map.setPaintProperty('chicago', 'raster-opacity', parseInt(e.target.value, 10) / 100);
  // var info = draw.setFeatureProperty(layer.id, 'display', true);
}
