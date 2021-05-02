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
var propertyDataset = "https://data.sfgov.org/resource/wv5m-vpq2.json";
var inputValue;
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
var ptsArray=[];

$("#yearRange").on("click", function(e) { //for year range slider
  year = $('#yearRange').val()
  $(".year").text(year);
 });

var customOptions = //for popup
  {
  'maxWidth': '400',
  'width': '200',
  'className' : 'popupCustom'
  }


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

  return L.marker([a.geometry.coordinates[1], a.geometry.coordinates[0]],
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
      var stationPoint = turf.point([a.geometry.coordinates[0], a.geometry.coordinates[1]]);
      var stationBuffer1 = turf.buffer(stationPoint, 0.5, {units: 'miles'});
      console.log("buffer is now a geoJSON", L.geoJSON(stationBuffer1, {color: '#977f8c'}))
      return L.geoJSON(stationBuffer1, {color: '#977f8c'})
    } 
  })
}



function makeBuffer2 (data){
  return data.map(function(a){
    if(a.properties.City == "San Francisco"){
      var stationPoint = turf.point([a.geometry.coordinates[0],a.geometry.coordinates[1]]);
      var stationBuffer2 = turf.buffer(stationPoint, 1, {units: 'miles'});
      return L.geoJSON(stationBuffer2, {color: '#d0bcca'})
    }

  })
}


function plotStationBuffer(buffer) {
  _.each(buffer,function(a){
    console.log(a)
    a.addTo(map)
  })
}



var makeMarkers = function(data) {
    return data.map(function(a){
    if (Object.keys(a).includes("the_geom")==true) {
      var customIcon = L.divIcon({className: "propertyPoint"});
      var markerOptions = { icon: customIcon };
      leafletMarker = L.marker([a.the_geom.coordinates[1], a.the_geom.coordinates[0]], markerOptions).bindPopup("Neighborhood: " + a.assessor_neighborhood +
      "<br>Address: " + a.property_location +
      "<br>Year Built: " + a.year_property_built+
      "<br>Use: " +a.use_definition+
      "<br>Personal Property Value: "+a.assessed_personal_property_value+
      "<br>Land Value: " + a.assessed_land_value +
      "<br>Improvement Value: " +a. assessed_improvement_value, 
      customOptions )
      console.log(leafletMarker)
      return leafletMarker
    }
  })
}


function plotPropertyMarker(marker) {
  _.each(marker,function(a){
    a.addTo(map)
  })
}

function prepPropPts(data) {
  data.map(function(a) {
    var coords = [a.the_geom.coordinates[1], a.the_geom.coordinates[0]];
    var yearBuilt = a.year_property_built;
    var yearBuiltObj =  {"Year Built": yearBuilt};
    var pt = turf.point(coords, yearBuiltObj);
    ptsArray.push(pt)
  })
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
    url: stationDataset,
    type:"GET",
    data: {
      format: 'geojson'
    }
  }),
).then(function(station) {
  //* All about stations *//
  stationData = JSON.parse(station).features;
  plotStationMarker(stationData);
  Buffer1 = makeBuffer1(stationData);
  Buffer1 = Buffer1.filter(function(x){
    return x!==undefined
  })
  console.log("Buffer1", Buffer1)
  // bufferarray(Buffer1);
  Buffer2 = makeBuffer2(stationData);
  Buffer2 = Buffer2.filter(function(x){
    return x!==undefined
  })
  console.log("Buffer2", Buffer2)
  plotStationBuffer(Buffer1);
  plotStationBuffer(Buffer2);

  var Buffer1feature = Buffer1.map(function(layer){return layer}); //deleted to.GeoJSON();
  Buffer1featurecollection = turf.featureCollection(Buffer1feature);
  var Buffer2feature = Buffer2.map(function(layer){return layer});
  Buffer2featurecollection = turf.featureCollection (Buffer2feature);

  //* sidebar interactions *//
  $('#sidebarCollapse').on('click', function (e) {
    $('#sidebar').toggleClass('active');
    $('#map').toggleClass('active');
  });

  //* search interactions *//
  $("#searchButton").on("click", function(e) {
    resetMap()
    yearValue= $('#yearRange').val();
    neighValue= $('#neighInput').val().replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()); // this capitalize the first letter of each word
    proptValue= $('#proptInput').val();
    if (neighValue == "") {
      filteredDataset = propertyDataset + "?" + "closed_roll_year=" + yearValue + "&use_definition=" + proptValue;
    } else {
      filteredDataset = propertyDataset + "?" + "closed_roll_year=" + yearValue + "&use_definition=" + proptValue + "&assessor_neighborhood=" + neighValue;
    }
    //* Get filtered property value *//
    $.ajax({
      type:"GET",
      url: filteredDataset, //?closed_roll_year=2019&property_class_code=D
      data: {
        "$limit" : 1000000,
        "$$app_token" : "1tkBmJ7LlU1rL4drYdWaz9Ytr"
      }
    }).done(function(property) {
      currentmarkers = makeMarkers(property);
      console.log(filteredDataset, property)
      //map.flyTo(currentmarkers[0]._latlng)
      //map.flyTo(currentmarkers[0])
      plotPropertyMarker(currentmarkers)
      prepPropPts(property);
      var pointFC = turf.featureCollection(ptsArray);
      console.log("ptsfc", pointFC) 
      console.log("bufferFeatureCollectoin",  Buffer1featurecollection) //Seems right
      var collected = turf.collect(pointFC, Buffer1featurecollection, 'Year Built', 'Value'); // doesn't work right here with new turf version buffer - getting a TypeError
      // Here's "turf.collect()" documentation: https://turfjs.org/docs/#collect
      console.log("collected", collected); // doesn't work right here with old turf version buffer
      var values = collected.features[0].properties.values
      console.log("values", values)

      //* prepare lookup table *//
      ///*Convert to multipolygon feature *///
      var polygon = Buffer1[2].toGeoJSON();
      console.log(polygon)
      console.log("points array", ptsArray)


    })
      
/*     filteredProperty = propertyData.filter(a => a.assessor_neighborhood === inputValue) 
    console.log(filteredProperty)
    currentmarkers = makeMarkers (filteredProperty)
    currentmarkers=currentmarkers.filter(function(x){
      return x !== undefined
    })

    console.log(currentmarkers) */
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
/*     var propertyfeature = currentmarkers.map(function(a){ return a.toGeoJSON()})
    propertyfeaturecollection = turf.featureCollection(propertyfeature);
    console.log(propertyfeature)
    console.log(propertyfeaturecollection)
    plotPropertyMarker(currentmarkers)

    return(inputValue,filteredProperty,propertyfeaturecollection); */
  })  ;



})
