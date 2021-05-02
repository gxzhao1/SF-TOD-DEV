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
var inputValue ;
var filteredProperty;
var previousmarkers=[];
var currentmarkers=[];
var Buffer1=[];
var Buffer2=[];
var Buffer1Property;
var propertyfeaturecollection;
var Buffer1featurecollection;
var Buffer2featurecollection;
var Bufferarray=[];




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

// function bufferarray (buffer){
//   for (i=0;i<buffer.length;i++){
//     Bufferarray[i]=[];
//     for (j=0;j<buffer[i]._latlngs[0].length;j++){
//       Bufferarray[i].push([buffer[i]._latlngs[0][j].lat,buffer[i]._latlngs[0][j].lng])
//     }
//   }
//   return Bufferarray
// }

function pointclassify (marker,buffer){
  for (i=0;i<marker.length;i++){
    for (j=0; j< buffer.length;i++){
      marker[i]=[];
      buffer[j]=[];
      var propertyfeature = marker[i].toGeoJSON();
      var polygon = buffer[j].toGeoJSON();
      if (turf.inside(propertyfeature,polygon)===true){
        console.log (marker[i],buffer[j])
      }
    }
  }
}




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

function makeBuffer1 (data){
  return data.map(function(a){
    if(a.properties.City == "San Francisco"){    /* Not Working */
      var stationPoint = turf.point([a.geometry.coordinates[1],a.geometry.coordinates[0]]);
      var stationBuffer1 = turf.buffer(stationPoint, 0.5, "miles");
      return L.polygon(stationBuffer1.geometry.coordinates, {color: '#977f8c'})
    }
  })
}

function makeBuffer2 (data){
  return data.map(function(a){
    if(a.properties.City == "San Francisco"){
      var stationPoint = turf.point([a.geometry.coordinates[1],a.geometry.coordinates[0]]);
      var stationBuffer2 = turf.buffer(stationPoint, 1, "miles");
      return L.polygon(stationBuffer2.geometry.coordinates, {color: '#d0bcca'})
    }

  })
}


function plotStationBuffer(buffer) {
  _.each(buffer,function(a){
    a.addTo(map)
  })
}



  var makeMarkers = function(data) {
     return data.map(function(a){
      if (Object.keys(a).includes("the_geom")==true){  /* Not Working */
        var customIcon = L.divIcon({className: "propertyPoint"});
        var markerOptions = { icon: customIcon };
        return L.marker([a.the_geom.coordinates[1],a.the_geom.coordinates[0]],markerOptions).bindPopup("Neighborhood: " + a.assessor_neighborhood +
        "<br>Address: " + a.property_location +
        "<br>Year Built: " + a.year_property_built+
        "<br>Use: " +a.use_definition+
        "<br>Personal Property Value: "+a.assessed_personal_property_value+
        "<br>Land Value: " + a.assessed_land_value +
        "<br>Improvement Value: " +a. assessed_improvement_value )
      }
    })
    }






function plotPropertyMarker(marker) {
  _.each(marker,function(a){
    a.addTo(map)
  })
  previousmarkers = currentmarkers
  return previousmarkers
}


 var resetMap = function (){
   _.each(previousmarkers,function(marker,i){
     map.removeLayer(marker);
   })
   previousmarkers=[];
 }







/* ===================== Main Process ===================== */
$.when(
  $.ajax({
    url:"https://raw.githubusercontent.com/gxzhao1/SF-TOD-DEV/main/Data/BART_Station.geojson",
    type:"GET",
    data: {
      format: 'geojson'
    }
  }),
  $.ajax({
    type:"GET",
    url: "https://data.sfgov.org/resource/wv5m-vpq2.json",
    data: {
      "$limit" : 10000,
      "$$app_token" : "1tkBmJ7LlU1rL4drYdWaz9Ytr"
    }
  })
).then(function(station, property) {
    stationData = JSON.parse(station[0]).features;
    propertyData = property[0];
    console.log(propertyData)
    plotStationMarker(stationData);
    Buffer1 = makeBuffer1(stationData);
    Buffer1 = Buffer1.filter(function(x){
      return x!==undefined
    })
    // bufferarray(Buffer1);
    Buffer2 = makeBuffer2(stationData);
    Buffer2 = Buffer2.filter(function(x){
      return x!==undefined
    })
    plotStationBuffer(Buffer1);
    plotStationBuffer(Buffer2);

    var Buffer1feature = Buffer1.map(function(layer){return layer.toGeoJSON()});
    Buffer1featurecollection = turf.featureCollection(Buffer1feature);
    var Buffer2feature = Buffer2.map(function(layer){return layer.toGeoJSON()});
    Buffer2featurecollection = turf.featureCollection (Buffer2feature);

    $('#sidebarCollapse').on('click', function (e) {
      $('#sidebar').toggleClass('active');
      $('#map').toggleClass('active');
    });

    $("#searchButton").on("click", function(e) {
      resetMap()
      inputValue= $('#searchInput').val()
      filteredProperty = propertyData.filter(a => a.assessor_neighborhood === inputValue)  /*toLowerCase(): cannot read property :toLowerCase" of undefined*/

      currentmarkers = makeMarkers (filteredProperty)
      currentmarkers=currentmarkers.filter(function(x){
        return x !== undefined
      })
  
      console.log(currentmarkers)
      /* Write a function to filter the currentmarkers*/
      // pointclassify(currentmarkers,Buffer1);  ....function
      /* test work, function does not work*/
      // var propertyfeature = currentmarkers[1].toGeoJSON();
      // var polygon = Buffer1[2].toGeoJSON();
      // var features = {"type": "FeatureCollection","features": [propertyfeature,polygon]}
      // console.log(features)
      // console.log(turf.inside(propertyfeature,polygon))  /* Inside Work*/
      // var propertyfeature = currentmarkers.map(function(point){return point.toGeoJSON()});
      /*........inside needs freature instead feature collection..... */
      var propertyfeature = currentmarkers.map(function(a){ return a.toGeoJSON()})
      propertyfeaturecollection = turf.featureCollection(propertyfeature);
      console.log(propertyfeature)
      console.log(propertyfeaturecollection)
      plotPropertyMarker(currentmarkers)

      return(inputValue,filteredProperty,propertyfeaturecollection);
    })  ;



  })













