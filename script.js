var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 43.658419, lng: -79.38454795},
    zoom: 10
  });
}

function getTimeString(var ms) {
  return new Date(ms).toDateString();
}

var slider = document.getElementById('myRange');
slider.max = new Date().getTime();
slider.min = 1262304000000;
slider.value = slider.min;

var counter = document.getElementById('counter');
counter.innerHTML = getTimeString(slider.value);

slider.oninput = function() {
    counter.innerHTML = this.value;
}
