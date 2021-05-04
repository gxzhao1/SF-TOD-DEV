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
var Buffer1FC;
var Buffer2FC;
var Bufferarray=[];
var ptsArray=[];
var markerFG;

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
      console.log("buffer", stationBuffer1)
      return stationBuffer1
    } 
  })
}

function leafletBuffer1 (bufferFeature) {
  return bufferFeature.map(function(a){
  console.log("buffer1 is now a geoJSON", L.geoJSON(a, {color: '#977f8c'}))
  return L.geoJSON(a, {color: '#977f8c'})
  })
}



function makeBuffer2 (data){
  return data.map(function(a){
    if(a.properties.City == "San Francisco"){
      var stationPoint = turf.point([a.geometry.coordinates[0],a.geometry.coordinates[1]]);
      var stationBuffer2 = turf.buffer(stationPoint, 1, {units: 'miles'});
      return stationBuffer2
    }
  })
}

function leafletBuffer2 (bufferFeature) {
  return bufferFeature.map(function(a){
  console.log("buffer2 is now a geoJSON", L.geoJSON(a, {color: '#d0bcca'}))
  return L.geoJSON(a, {color: '#d0bcca'})
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
    var coords = [a.the_geom.coordinates[0], a.the_geom.coordinates[1]];
    var yearBuilt = a.year_property_built;
    var yearBuiltObj =  {yearBuilt: yearBuilt};
    var pt = turf.point(coords, yearBuiltObj);
    ptsArray.push(pt)
  })
}  /* Property*/


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
  ///* Plot buffer *///
  stationData = JSON.parse(station).features;
  plotStationMarker(stationData);
  Buffer1 = makeBuffer1(stationData);
  Buffer1 = Buffer1.filter(function(x){
    return x!==undefined
  })
  Buffer1geojson = leafletBuffer1(Buffer1);
  Buffer2 = makeBuffer2(stationData);
  Buffer2 = Buffer2.filter(function(x){
    return x!==undefined
  })
  Buffer2geojson = leafletBuffer2(Buffer2);
  plotStationBuffer(Buffer1geojson);
  plotStationBuffer(Buffer2geojson);
  
  ///* Turn buffer into feature collection *///
  Buffer1FC = turf.featureCollection(Buffer1);
  Buffer2FC = turf.featureCollection(Buffer2);

  //* sidebar interactions *//
  $('#sidebarCollapse').on('click', function (e) {
    $('#sidebar').toggleClass('active');
    $('#map').toggleClass('active');
    $('#sidebarContent').toggleClass('active');
  });

  //* search interactions *//
  $("#searchButton").on("click", function(e) {
    resetMap()
    yearValue= $('#yearRange').val();
    neighValue= $('#neighInput').val().replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()); // this capitalize the first letter of each word
    proptValue= $('#proptInput').val();
    if (neighValue == "") {
      filteredDataset = propertyDataset + "?" + "closed_roll_year=" + yearValue + "&use_definition=" + proptValue + "&assessor_neighborhood=" + "Financial District North";
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
      console.log(currentmarkers.length)
      //* Warning + Fly to *//
      if (currentmarkers.length == 0) {
        alert("Could not find corresponding value\nPlease try again");
      } else {
        markerFG = L.featureGroup(currentmarkers);
        console.log(markerFG)
        map.flyToBounds(markerFG.getBounds())
      }
      
      console.log(filteredDataset, property)


      plotPropertyMarker(currentmarkers)
      prepPropPts(property);
      //* Prepare for chart *// & Here's "turf.collect()" documentation: https://turfjs.org/docs/#collect
      var pointFC = turf.featureCollection(ptsArray);
      console.log("ptsfc", typeof(pointFC), pointFC)
      console.log("bufferFeatureCollection1", typeof(Buffer1FC), Buffer1FC)
      console.log("bufferFeatureCollection2", typeof(Buffer2FC), Buffer2FC)
      //* yearBuilt *//
      var yearBuiltc1 = turf.collect(Buffer1FC, pointFC, 'yearBuilt', 'yearBuiltValue');
      var yearBuiltc2 = turf.collect(Buffer2FC, pointFC, 'yearBuilt', 'yearBuiltValue');
      
      console.log("yearBuiltc1", yearBuiltc1);
      console.log("yearBuiltc2", yearBuiltc2);
      var values1 = yearBuiltc1.features[7].properties.yearBuiltValue;
      values1 = values1.filter(function(x){
        return x!==undefined
      })
      var values2 = yearBuiltc2.features[7].properties.yearBuiltValue;
      values2 = values2.filter(function(x){
        return x!==undefined
      })
      console.log("values for one of the 8 bart stations", values1, values2) //!! Needs to merge all buffers and then "collect" to get the value for all buffers as one

      var buf1Stat = math.mean(values1);
      var buf2Stat = math.mean(values2);

      ///* CHART *///
        // bar chart
        ctxBar = $("#barChart");
        barChart = new Chart(ctxBar, {
          type: "bar",
          data: {
            labels: ["within 0.5 mile distance", "within 1 mile distance"],
            datasets: [
              {
                label: "Average Built Year of Property",
                data: [
                  buf1Stat,
                  buf2Stat,
                ],
                backgroundColor: [
                  "rgba(250, 225, 221, 1)",
                  "rgba(250, 225, 221, 1)",
                ],
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        }); 

      //* prepare lookup table *//
      ///*Convert to multipolygon feature *///
/*       var polygon = Buffer1[2].toGeoJSON();
      console.log(polygon)
      console.log("points array", ptsArray) */


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
