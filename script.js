var map;
function initMap() {
  map = new google.maps.Map(d3.select("#map").node(), {
    center: {lat: 43.658419, lng: -79.38454795},
    zoom: 10
  });
}

printError = function(error) {
  console.log(error);
}

d3.json("/data/td_transaction_2018-04.json")
  .then(function(data) {

    console.log(data);

    var overlay = new google.maps.OverlayView();

    overlay.onAdd = function() {
      var layer = d3.select(this.getPanes().overlayLayer).append("div")
          .attr("class", "transactions");

      overlay.draw = function() {
        var projection = this.getProjection(),
          padding = 10;
        var radius = 5;


        var marker = layer.selectAll("svg")
          .data(d3.entries(data))
          .each(transform)
          .enter().append('svg')
          .each(transform)
          .attr("class", "transaction")

        marker.append("circle")
          .attr("r", radius)
          .attr("cx", padding)
          .attr("cy", padding);

        function transform(d) {
          d = new google.maps.LatLng(d.value[0].lat_long[0], d.value[0].lat_long[1]);
          d = projection.fromLatLngToDivPixel(d);
          return d3.select(this)
            .style("left", (d.x - padding) + "px")
            .style("top", (d.y - padding) + "px");
        }
      }
    }

    overlay.setMap(map);

  }, printError);

function getTimeString(ms) {
  return new Date(+ms).toDateString();
}

var slider = document.getElementById('myRange');
slider.max = new Date().getTime();
slider.min = 1262304000000; //the timestamp for 2010
slider.value = slider.min;

var counter = document.getElementById('counter');
counter.innerHTML = getTimeString(slider.value);

slider.oninput = function() {
    counter.innerHTML = getTimeString(this.value);
}
