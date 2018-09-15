var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 43.658419, lng: -79.38454795},
    zoom: 10
  });
}

var slider = document.getElementById('myRange');
var counter = document.getElementById('counter');
counter.innerHTML = slider.value;

slider.oninput = function() {
    counter.innerHTML = this.value;
}
