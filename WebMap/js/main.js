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
var inputValue;

var legend = L.control({ position: "bottomleft" });
legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<h4>Legend</h4>";
    div.innerHTML += '<i style="background: #3f999a"></i><span>BART stations SF</span><br>';
    div.innerHTML += '<i style="background: #9bc1bc"></i><span>BART stations non-SF</span><br>';
    div.innerHTML += '<i style="background: pink"></i><span>Property points</span><br>';
    div.innerHTML += '<i style="background: #977f8c"></i><span>0.5 mile buffer</span><br>';
    div.innerHTML += '<i style="background: #d0bcca"></i><span>1 mile buffer</span><br>';

    return div;
};
legend.addTo(map); 

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
      L.polygon(stationBuffer1.geometry.coordinates, {color: '#977f8c'}).addTo(map);
      L.polygon(stationBuffer2.geometry.coordinates, {color: '#d0bcca'}).addTo(map)
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


/* ===================== Main Process ===================== */
$.when(
  $.ajax(stationDataset), 
  $.ajax(propertyDataset)).then(function(station, property) {
  stationData = JSON.parse(station[0]).features;
  propertyData = property[0];
  console.log(propertyData)
  plotStationMarker(stationData);
  plotStationBuffer(stationData);
/*   I tried plotting with an example - it worked!
  filteredProperty = propertyData.filter(a => a.assessor_neighborhood.toLowerCase() == "russian hill");
  console.log(filteredProperty)
  plotPropertyMarker(filteredProperty); */

  

  $('#sidebarCollapse').on('click', function (e) {
    $('#sidebar').toggleClass('active');
    $('#map').toggleClass('active');
  });

  $("#searchButton").on("click", function(e) {
    const inputValue = $('#searchInput').val();
    console.log(inputValue);  /* I could not make inputValue a global variable or plot within this click event! Console log doesn't work but alert() does/ */
  })  

  /* These don't work yet */
  filteredProperty = propertyData.filter(a => a.assessor_neighborhood.toLowerCase() == inputValue);
  plotPropertyMarker(filteredProperty);

})
