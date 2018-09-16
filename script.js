var transaction_data = {};
var account_data = {};
var map;
var overlay;

function transform(d) {
  d = new google.maps.LatLng(d.lat_long[0], d.lat_long[1]);
  d = overlay.getProjection().fromLatLngToDivPixel(d);
  return d3.select(this)
      .style("left", (d.x - padding) + "px")
      .style("top", (d.y - padding) + "px")
}

function genToolTipHTML(d) {
  var cust = account_data[d['customer']];
  var template = `<div class="transact-tooltip">
    <img class="face-img" src="generic-face.png">
    <p class="tooltip-info">${cust['first_name']} ${cust['surname']}</p>
    <p class="tooltip-info">Age: ${cust['age']}</p>
    <p class="tooltip-info">Income: ${cust['income']}</p>
    <p class="tooltip-info">Merchant: ${d['merch_name']}</p>
    <p class="tooltip-info">Amount: \$${d['amount']}</p>
  </div>`

  return template;
}

function filterIncome(income) {
  selectValue = $("#filter-income").val();
  if (selectValue == "none") {
    return true;
  }
  if (selectValue == "0-25" && income >= 0 && income <= 25000) {
    return true;
  }
  if (selectValue == "25-50" && income > 25000 && income <= 50000) {
    return true;
  }
  if (selectValue == "50-75" && income > 50000 && income <= 75000) {
    return true;
  }
  if (selectValue == "75-100" && income > 75000 && income <= 100000) {
    return true;
  }
  if (selectValue == "100+" && income > 100000) {
    return true;
  }
  return false;
}

function filterAge(age) {
  selectValue = $("#filter-age").val();
  if (selectValue == "none") {
    return true;
  }
  if (selectValue == "18-24" && age >= 18 && age <= 24) {
    return true;
  }
  if (selectValue == "25-34" && age >= 25 && age <= 34) {
    return true;
  }
  if (selectValue == "35-44" && age >= 35 && age <= 44) {
    return true;
  }
  if (selectValue == "45-54" && age >= 45 && age <= 54) {
    return true;
  }
  if (selectValue == "55-64" && age >= 55 && age <= 64) {
    return true;
  }
  return false;
}

function peopleFilter(d) {
  income = +account_data[d['customer']]['income']
  age = +account_data[d['customer']]['age']
  var result = (filterIncome(income) && filterAge(age));
  return result;
}

function data_key(d) {
  return d['customer'] + d['desc'] + d['date_time']
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
      this.d3_update(false);
  }

  this.d3_update = function(animate) {
    if (this._dateString == null || !(this._dateString in transaction_data)) {
      d3.selectAll('circle').remove();
      return;
    }

    padding = 10;

    var transaction_join = this._div.selectAll("svg")
        .data(transaction_data[this._dateString].filter(peopleFilter), peopleFilter)
        .each(transform) // update existing markers

        padding = 10;
        
        var tooltip = this._tooltip;


        
    new_transactions = transaction_join.enter()
        .append("svg")
        .each(transform)
    
    if (animate) {
      old_transactions = transaction_join.exit()
        .transition()
        .duration(10)
        .style('opacity', '0')
        .remove();
    }
    else {
      old_transactions = transaction_join.exit().remove();
    }

    new_transactions.append("circle")
      .attr("r", 7)
      .attr("cx", padding)
      .attr("cy", padding)
      .on("mouseover", function(d, i) {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        var toolTipHTML = genToolTipHTML(d);
        tooltip.html(toolTipHTML)
          .style("left", (d3.event.pageX + 5) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d, i) {
          tooltip.transition()
            .duration(200)
            .style("opacity", 0);
        }); 
        
      if (animate) {
        new_transactions.append("circle")
          .attr("r", "7")
          .attr("cx", padding)
          .attr("cy", padding)
          .attr("class", "ping")
          .style("opacity", "0.7")
          .transition()
          .duration(750)
          .style("opacity", "0")
          .attr("r", "20")
          .remove();
      }
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
  $("#counter").text(moment.format("dddd, YYYY-MM-DD HH:00"));
  dateString = moment.format("YYYY-MM-DDTHH");
  overlay._dateString = dateString;
  overlay.d3_update(true);
}

$(window).on("load", function() {
  
  //init the slider
  slider = $("#myRange");
  slider.attr({
    min: 0,
    max: offset,
    value: 0
  });
  slider.on("input", function() {updateSlider()});

  $("#myRange").bind('mousewheel DOMMouseScroll', function(event){
    if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
        $("#myRange").val(+$("#myRange").val() + 3600000);
        updateSlider();
    }
    else {
        $("#myRange").val(+$("#myRange").val() - 3600000);
        updateSlider();
    }
  });
  
  //load in the transaction data
  for (var i = 3; i < 11; i++) {
    monthString = i;
    if (i < 10) {
      monthString = "0" + monthString;
    }
    $.getJSON("data/td_transaction_2018-" + monthString + ".json", function(data) {
      $.extend(transaction_data, data);
    });
  }

  //load in account data
  $.getJSON('data/td_accounts.json', function(data) {
    $.extend(account_data, data);
  });
 
  map = new google.maps.Map(d3.select("#map").node(), {
    center: {lat: 43.658419, lng: -79.38454795},
    zoom: 12
  });

  overlay = new D3Overlay();

  //redraw after some events so the dots don't get out of sync
  map.addListener('drag', function() {updateSlider()});
  map.addListener('zoom_changed', function() {updateSlider()});
  map.addListener('bounds_changed', function() {updateSlider()});
  map.addListener('tiles_loaded', function() {updateSlider()});
  map.addListener('idle', function() {updateSlider()});

  
  //force a redraw when the boxes change
  $("#filter-age").change(function() {overlay.d3_update(true)});
  $("#filter-income").change(function() {overlay.d3_update(true)});

  updateSlider();
});
