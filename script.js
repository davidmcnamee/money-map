var transaction_data = {};
var map;
var overlay;

$("#myRange").on('scroll', function(){
  console.log("scrolling");
   $("#myRange").val($("#myRange").value + 3600000);
});

function transform(d) {
  d = new google.maps.LatLng(d.lat_long[0], d.lat_long[1]);
  d = overlay.getProjection().fromLatLngToDivPixel(d);
  return d3.select(this)
      .style("left", (d.x - padding) + "px")
      .style("top", (d.y - padding) + "px");
}

function createTooltip(d, i) {
  this.tip = new Tooltip(this, {
    closeOnClickOutside: true,
    trigger: "manual"
  })
  this.tip.textContent = "HAIL SATAN";
  this.tip.updateTitleContent("HAIL SATAN");
}

D3Overlay.prototype = new google.maps.OverlayView();

function D3Overlay() {

  this._div = null;
  this._tooltip = null;
  this._dateString = null;

  this.setMap(map);

  D3Overlay.prototype.onAdd = function() {
    this._div = d3.select(this.getPanes().overlayMouseTarget).append("div")
        .attr("class", "transactions");

    this._tooltip = d3.select("body")
      .append("div")
    	.attr("class", "tooltip")
    	.style("opacity", 0);
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

      var div = $(".transact-popover");

      var tooltip = this._tooltip;

      // Add a circle.
      new_transactions.append("circle")
        .attr("r", 7)
        .attr("cx", padding)
        .attr("cy", padding)
        .on("mouseover", function(d) {
          tooltip.transition()
            .duration(200)
            .style("opacity", .9);
          tooltip.html("fisherman")
            .style("left", (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
      	  })
          .on("mouseout", function(d) {
            tooltip.transition()
              .duration(200)
              .style("opacity", 0);
          });

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

var slider;

function updateSlider() {
  moment = sliderToMoment(slider.val());
  $("#counter").text(moment.format("YYYY-MM-DD HH:00"));
  dateString = moment.format("YYYY-MM-DDTHH");
  overlay._dateString = dateString;
  overlay.draw();
}

$(window).on("load", function() {

  slider = $("#myRange");
  slider.attr({
    min: 0,
    max: offset,
    value: 0
  });

  slider.on("input", function() {updateSlider()});




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

  //redraw after some events so the dots don't get out of sync
  map.addListener('drag', function() {overlay.draw()});
  map.addListener('zoom_changed', function() {overlay.draw()});

  updateSlider();
});
