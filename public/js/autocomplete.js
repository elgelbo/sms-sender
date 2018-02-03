var address = document.getElementById('address');
var lat = document.getElementById('lat');
var lng = document.getElementById('lng');

function autocomplete(input, latInput, lngInput) {
  if (!input) return; //skip if no input on page
  var dropdown = new google.maps.places.Autocomplete(input);
  dropdown.addListener('place_changed', () => {
    const place = dropdown.getPlace();
    latInput.value = place.geometry.location.lat();
    lngInput.value = place.geometry.location.lng();
  })
  input.addEventListener('keydown', (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  });
}

autocomplete(address, lat, lng);
