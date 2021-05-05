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
var Bufferarray1=[];
var ptsArray=[];
var markerFG;
var yearvalues1=[];
var yearvalues2=[];
var PPVvalues1 = [];
var PPVvalues2 = [];



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
function bufferarray (buffer){
  for (i=0;i<buffer.length;i++){
    Bufferarray1[i]=[];
    for (j=0;j<buffer[i].geometry.coordinates[0].length;j++){
      Bufferarray1[i].push([buffer[i].geometry.coordinates[0][j][0],buffer[i].geometry.coordinates[0][j][1]])
    }
  }
  return Bufferarray1
}

var resetCanvas1 = function(){
  $('#barChart').remove(); // this is my <canvas> element
  $('#sidebarContent').append('<canvas id="barChart"><canvas>');
  canvas = document.querySelector('#barChart');
  ctx = canvas.getContext('2d');
  ctx.canvas.width = $('#sidebarContent').width(); // resize to parent width
  ctx.canvas.height = $('#sidebarContent').height(); // resize to parent height
  var x = canvas.width/2;
  var y = canvas.height/2;
  ctx.font = '10pt Verdana';
  ctx.textAlign = 'center';
  ctx.fillText('This text is centered on the canvas', x, y);
};

var resetCanvas2 = function(){
  $('#barChart2').remove(); // this is my <canvas> element
  $('#sidebarContent').append('<canvas id="barChart2"><canvas>');
  canvas = document.querySelector('#barChart2');
  ctx = canvas.getContext('2d');
  ctx.canvas.width = $('#sidebarContent').width(); // resize to parent width
  ctx.canvas.height = $('#sidebarContent').height(); // resize to parent height
  var x = canvas.width/2;
  var y = canvas.height/2;
  ctx.font = '10pt Verdana';
  ctx.textAlign = 'center';
  ctx.fillText('This text is centered on the canvas', x, y);
};

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
  previousmarkers = currentmarkers
  return previousmarkers
}

function prepPropPts(data) {
  data.map(function(a) {
    var coords = [a.the_geom.coordinates[0], a.the_geom.coordinates[1]];
    var yearBuilt = a.year_property_built;
    var PPV = a.assessed_personal_property_value;
    var LV = a.assessed_land_value;
    var IV = a.assessed_improvement_value;
    var PropertyObj =  {yearBuilt: yearBuilt,Personal_Property_Value: PPV, Land_Value: LV, Improvement_Value: IV};
    var pt = turf.point(coords, PropertyObj);
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
  // Bufferarray1 = bufferarray(Buffer1);
  // var buffer1polygon1 = turf.polygon([Bufferarray1[0]]);
  // var buffer1polygon2 = turf.polygon([Bufferarray1[1]]);
  // var buffer1polygon3 = turf.polygon([Bufferarray1[2]]);
  // var buffer1polygon4 = turf.polygon([Bufferarray1[3]]);
  // var buffer1polygon5 = turf.polygon([Bufferarray1[4]]);
  // var buffer1polygon6 = turf.polygon([Bufferarray1[5]]);
  // var buffer1polygon7 = turf.polygon([Bufferarray1[6]]);
  // var buffer1polygon8 = turf.polygon([Bufferarray1[7]]);
  // Buffer1Union = turf.union(buffer1polygon1,buffer1polygon2,buffer1polygon3,buffer1polygon4,buffer1polygon5,buffer1polygon6,buffer1polygon7,buffer1polygon8);
  // console.log("Buffer1Union",Buffer1Union)

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
  // Buffer1Union = turf.union(Buffer1);
  // Buffer2Union = turf.union(Buffer2);
  // console.log("Buffer1Union",Buffer1Union)
  // console.log("Buffer2Union",Buffer2Union)

  //* sidebar interactions *//
  $('#sidebarCollapse').on('click', function (e) {
    $('#sidebar').toggleClass('active');
    $('#map').toggleClass('active');
    $('#sidebarContent').toggleClass('active');
  });

  //* search interactions *//
  $("#searchButton").on("click", function(e) {
    resetMap()
    resetCanvas1();
    resetCanvas2();
    ptsArray=[];
    yearvalues1=[];
    yearvalues2=[];
    PPVvalues1 = [];
    PPVvalues2 = [];
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
      for (i=0;i<yearBuiltc1.features.length;i++){
        if(yearBuiltc1.features[i].properties.yearBuiltValue.length!==0){
          for(j=0;j<yearBuiltc1.features[i].properties.yearBuiltValue.length;j++){
            yearvalues1.push(yearBuiltc1.features[i].properties.yearBuiltValue[j]) 
          }
        }
      }
      var values1 = yearvalues1;
      values1 = values1.filter(function(x){
        return x!==undefined
      })
      for (i=0;i<values1.length;i++){
        values1[i] = Number(values1[i]);
      }
      for (i=0;i<yearBuiltc2.features.length;i++){
        if(yearBuiltc2.features[i].properties.yearBuiltValue.length!==0){
          for(j=0;j<yearBuiltc2.features[i].properties.yearBuiltValue.length;j++){
            yearvalues2.push(yearBuiltc2.features[i].properties.yearBuiltValue[j]) 
          }
        }
      }
      var values2 = yearvalues2;
      values2 = values2.filter(function(x){
        return x!==undefined
      })
      for (i=0;i<values2.length;i++){
        values2[i] = Number(values2[i]);
      }
      console.log("values for one of the 8 bart stations", values1, values2) //!! Needs to merge all buffers and then "collect" to get the value for all buffers as one

      if (values1.length===0){
        var buf1Stat = 0;
      } else {
        var buf1Stat = math.round(math.mean(values1));
      }

      if(values2.length === 0){
        var buf2Stat = 0;
      }else{
        var buf2Stat = math.round(math.mean(values2));

      }

      if(values1.length===0 & values2.length===0){
        alert("There is no property in TOD!")
      }

      
      
      //* personal Property Value *//
      var PPVc1 = turf.collect(Buffer1FC, pointFC, 'Personal_Property_Value', 'Personal_Property_Value');
      var PPVc2 = turf.collect(Buffer2FC, pointFC, 'Personal_Property_Value', 'Personal_Property_Value');
      console.log("PPVc1", PPVc1);
      console.log("PPVc2", PPVc2);
      for (i=0;i<PPVc1.features.length;i++){
        if(PPVc1.features[i].properties.Personal_Property_Value.length!==0){
          for(j=0;j<PPVc1.features[i].properties.Personal_Property_Value.length;j++){
            PPVvalues1.push(PPVc1.features[i].properties.Personal_Property_Value[j]) 
          }
        }
      }
      var ppvvalues1 = PPVvalues1.filter(function(x){
        return x!==undefined
      })
      for (i=0;i<ppvvalues1.length;i++){
        ppvvalues1[i] = Number(ppvvalues1[i]);
      }
      for (i=0;i<PPVc2.features.length;i++){
        if(PPVc2.features[i].properties.Personal_Property_Value.length!==0){
          for(j=0;j<PPVc2.features[i].properties.Personal_Property_Value.length;j++){
            PPVvalues2.push(PPVc2.features[i].properties.Personal_Property_Value[j]) 
          }
        }
      }
      var ppvvalues2 = PPVvalues2.filter(function(x){
        return x!==undefined
      })
      for (i=0;i<ppvvalues2.length;i++){
        ppvvalues2[i] = Number(PPVvalues2[i]);
      }
      console.log("values for one of the 8 bart stations", ppvvalues1, ppvvalues2) 

      if (ppvvalues1.length===0){
        var buf1Stat2 = 0;
      } else {
        var buf1Stat2 = math.round(math.mean(ppvvalues1));
      }

      if(ppvvalues2.length === 0){
        var buf2Stat2 = 0;
      }else{
        var buf2Stat2= math.round(math.mean(ppvvalues2));

      }

      // if(values1.length===0 & values2.length===0){
      //   alert("There is no property in TOD!")
      // }

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
        // barChart.destroy();
        ctxBar2 = $("#barChart2");
        barChart2 = new Chart(ctxBar2, {
          type: "bar",
          data: {
            labels: ["within 0.5 mile distance", "within 1 mile distance"],
            datasets: [
              {
                label: "Average Personal Property Value",
                data: [
                  buf1Stat2,
                  buf2Stat2,
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
