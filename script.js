var transaction_data = {};
var map;
var overlay;

function transform(d) {
  d = new google.maps.LatLng(d.lat_long[0], d.lat_long[1]);
  d = overlay.getProjection().fromLatLngToDivPixel(d);
  return d3.select(this)
      .style("left", (d.x - padding) + "px")
      .style("top", (d.y - padding) + "px");
}

D3Overlay.prototype = new google.maps.OverlayView();

function D3Overlay() {

  this._div = null;
  this._dateString = null;

  this.setMap(map);

  D3Overlay.prototype.onAdd = function() {
    this._div = d3.select(this.getPanes().overlayMouseTarget).append("div")
        .attr("class", "transactions");
  }

  D3Overlay.prototype.draw = function() {
      if (this._dateString == null || !(this._dateString in transaction_data)) {
        return;
      }
      
      padding = 10;

      var transaction_join = this._div.selectAll("svg")
          .data(transaction_data[this._dateString])
          .each(transform) // update existing markers

      old_transactions = transaction_join.exit().remove();

      new_transactions = transaction_join.enter().append("svg")
          .each(transform)
          .attr("class", "transaction")

      // Add a circle.
      new_transactions.append("circle")
          .attr("r", 6)
          .attr("cx", padding)
          .attr("cy", padding);
      
  }

  D3Overlay.prototype.onRemove = function() {
    this._div.remove();
  }
}

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
  $("#counter").text(moment.format("YYYY-MM-DD HH:00"));
  dateString = moment.format("YYYY-MM-DDTHH");
  overlay._dateString = dateString;
  overlay.draw();
}

slider.oninput = function() {
  updateSlider();
}

$(window).on("load", function() {
  
  for (var i = 3; i < 11; i++) {
    monthString = i;
    if (i < 10) {
      monthString = "0" + monthString;
    }
    $.getJSON("data/td_transaction_2018-" + monthString + ".json", function(data) {
      $.extend(transaction_data, data);
    });
  }
 
  map = new google.maps.Map(d3.select("#map").node(), {
    center: {lat: 43.658419, lng: -79.38454795},
    zoom: 12
  });

  overlay = new D3Overlay();

  updateSlider();
});

