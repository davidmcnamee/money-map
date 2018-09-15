var transaction_data = {};
overlay = null;

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
    zoom: 10
  });

  updateSlider();
});

function d3_update(dateString) {

  if (!(dateString in transaction_data)) {
    return;
  }

  if (overlay != null) {
    overlay.setMap(null);
  }
  
  overlay = new google.maps.OverlayView();

  overlay.onAdd = function() {
    var layer = d3.select(this.getPanes().overlayLayer).append("div")
        .attr("class", "transactions");

    overlay.onRemove = function() {
      layer.remove();
    }

    overlay.draw = function() {
      var projection = this.getProjection(),
          padding = 10;

      var marker = layer.selectAll("svg")
          .data(transaction_data[dateString])
          .each(transform) // update existing markers
        .enter().append("svg")
          .each(transform)
          .attr("class", "transaction");

      // Add a circle.
      marker.append("circle")
          .attr("r", 4.5)
          .attr("cx", padding)
          .attr("cy", padding);

      function transform(d) {
        d = new google.maps.LatLng(d.lat_long[0], d.lat_long[1]);
        d = projection.fromLatLngToDivPixel(d);
        return d3.select(this)
            .style("left", (d.x - padding) + "px")
            .style("top", (d.y - padding) + "px");
      }
    };
  };

  // Bind our overlay to the map…
  overlay.setMap(map);
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
  $("#counter").innerHTML = moment.format("YYYY-MM-DD HH:00");
  dateString = moment.format("YYYY-MM-DDTHH");
  d3_update(dateString);
}

slider.oninput = function() {
  updateSlider();
}

