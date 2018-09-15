var transaction_data = {};

function d3Overlay() {
  var _div = null;
  var _dateString = null;
  var _projection = null;

  function transform(d) {
    d = new google.maps.LatLng(d.lat_long[0], d.lat_long[1]);
    d = projection.fromLatLngToDivPixel(d);
    return d3.select(this)
      .style("left", (d.x - padding) + "px")
      .style("top", (d.y - padding) + "px");
  }

  this.onAdd = function() {
    _div = d3.select(this.getPanes().overlayLayer)
             .append("div")
             .attr("class", "transactions");
  };
  
  this.onDraw = function() {
    var projection = this.getProjection(),
        padding = 5;
    var radius = 2;

    var marker = _div.selectAll("svg")
      .data(transaction_data[dateString])
        .each(transform) // update existing markers
        .enter().append("svg:svg")
        .each(transform)
        .attr("class", "transaction");

    marker.append("svg:circle") 
      .attr("r", radius)
      .attr("cx", padding)
      .attr("cy", padding);
  };

  this.onRemove = function () {
    _div.remove();
  };

  this.update = function(dateString) {
    //this.draw();
    _div.selectAll("svg")
      .data(transaction_data[dateString]) 
      .each(transform); 
  }

}

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

$(window).on("load", function() {
  
  initMap();

  for (var i = 3; i < 11; i++) {
    monthString = i;
    if (i < 10) {
      monthString = "0" + monthString;
    }
    $.getJSON("data/td_transaction_2018-" + monthString + ".json", function(data) {
      $.extend(transaction_data, data);
    });
  }

  d3Overlay.prototype = new google.maps.OverlayView();
  overlay = new d3Overlay();
  overlay.setMap(map);

  updateSlider();
});

var beginDate = getMoment("2018-03-02T01");
var endDate = getMoment("2018-10-16T24");

var offset = endDate.toDate() - beginDate.toDate();

function getMoment(string) {
  return moment(string, "YYYY-MM-DDTHH");
}

function sliderToMoment(value) {
  date = beginDate.clone().add(value, 'ms');
  return date;
}

var slider = document.getElementById('myRange');
slider.max = offset
slider.min = 0
slider.value = slider.min;

function updateSlider() {
  moment = sliderToMoment(slider.value);
  $("#counter").innerHTML = moment.format("YYYY-MM-DD HH:00");
  dateString = moment.format("YYYY-MM-DDTHH");
  overlay.update(dateString);
}

slider.oninput = function() {
  updateSlider();
}

