/* Load in base map */
var map = L.map('map', {
  center: [37.73705525336632, -122.3710158203125],
  zoom: 12
});

var Stamen_TonerLite = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
}).addTo(map);

/* Global Vars */
var stationDataset = "https://raw.githubusercontent.com/gxzhao1/SF-TOD-DEV/main/Data/BART_Station.geojson";
var propertyDataset = "https://data.sfgov.org/resource/wv5m-vpq2.json?closed_roll_year=2019&property_class_code=D";

/*====== Functions ======*/


/*=== Map Functions ===*/
function plotStationMarker(data) {
  data.map(function(a) {
    if (a.properties.City == "San Francisco") {
      var customIcon = L.divIcon({className: "SFstations"});
  } else {
      var customIcon = L.divIcon({className: "Others"});
  }

  var markerOptions = { icon: customIcon }; 

  return L.marker([a.geometry.coordinates[1],a.geometry.coordinates[0]],
      markerOptions 
      ).addTo(map).bindPopup(
          "Name: " + a.properties.Name +
          "<br>Address: " + a.properties.Street +
          "<br>Link: " + a.properties.Link)
      })
}

function plotStationBuffer(data) {
  data.map(function(a) {
    if (a.properties.City == "San Francisco") {
      var stationPoint = turf.point([a.geometry.coordinates[1],a.geometry.coordinates[0]]);
      var stationBuffer1 = turf.buffer(stationPoint, 0.5, "miles");
      var stationBuffer2 = turf.buffer(stationPoint, 1, "miles");
      L.polygon(stationBuffer1.geometry.coordinates, {color: 'pink'}).addTo(map);
      L.polygon(stationBuffer2.geometry.coordinates, {color: 'pink'}).addTo(map)
    }
  })
}

function plotPropertyMarker(data) {
  data.map(function(a) {
    if (Object.keys(a).includes("the_geom")) {
      var customIcon = L.divIcon({className: "propertyPoint"});
      var markerOptions = { icon: customIcon }; 
      return L.marker([a.the_geom.coordinates[1],a.the_geom.coordinates[0]],
        markerOptions 
        ).addTo(map)/* .bindPopup(
            "Name: " + a.properties.Name +
            "<br>Address: " + a.properties.Street +
            "<br>Link: " + a.properties.Link) */
    }
  })
}

/* legend.addTo(map);  */

/* $(document).ready(function(){
  $("#floatingInput").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $("#myDIV *").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
  });
}) */

/* ===================== Examine data ===================== */
$.when(
  $.ajax(stationDataset), 
  $.ajax(propertyDataset)).then(function(station, property) {
  stationData = JSON.parse(station[0]).features;
  propertyData = property[0];

  plotStationMarker(stationData);
  plotStationBuffer(stationData);
  plotPropertyMarker(propertyData);

  $('#sidebarCollapse').on('click', function () {
    $('#sidebar').toggleClass('active');
    $('#map').toggleClass('active');
  });

  $("#searchButton").on("click", function() {
    inputValue = $('#searchInput').val().toLowerCase();  
    filteredProperty = propertyData.filter(a => a.assessor_neighborhood.toLowerCase == inputValue);
    alert(inputValue)
  })  

})


/* 2019 property data */
$.ajax({
  url: "https://data.sfgov.org/resource/wv5m-vpq2.json?closed_roll_year=2019&property_class_code=D",
  type: "GET",
  data: {
    "$limit" : 1000,
/*     "$$app_token" : "YOURAPPTOKENHERE" */
  }
}).done(function(data) {
propertyData = data;
});


/* BART track (optional) */
$.ajax({
  url: "https://raw.githubusercontent.com/gxzhao1/SF-TOD-DEV/main/Data/BART_Track.geojson",
  type: "GET",
}).done(function(data) {
/* alert("Retrieved " + data.length + " records from the dataset!"); */
data = JSON.parse(data),
console.log("BART track", data.features);
});
