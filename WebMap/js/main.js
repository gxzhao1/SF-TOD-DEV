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
var Buffer3 = [];
var Buffer1FC;
var Buffer2FC;
var Buffer3FC;
var ptsArray=[];
var markerFG;
var yearvalues1=[];
var yearvalues2=[];
var yearvalues3=[];
var PPVvalues1 = [];
var PPVvalues2 = [];
var PPVvalues3 = [];
var LVvalues1 = [];
var LVvalues2 = [];
var LVvalues3 = [];
var IVvalues1 = [];
var IVvalues2 = [];
var IVvalues3 = [];



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
    div.innerHTML += '<i style="background: #E6DBE2"></i><span>2 mile buffer</span><br>';

    return div;
};
legend.addTo(map); 

/*====== Functions ======*/


var resetCanvas1 = function(){
  $('#barChart').remove(); // this is my <canvas> element
  $('#sidebarContent').append('<canvas id="barChart"><canvas>');
  canvas = document.querySelector('#barChart');
  ctx = canvas.getContext('2d');
  ctx.canvas.width = $('#sidebarContent').width(); // resize to parent width
  ctx.canvas.height = 175; // resize to parent height
  var x = canvas.width/2;
  var y = canvas.height/2;
  ctx.font = '10pt Verdana';
  ctx.textAlign = 'center';
};

var resetCanvas2 = function(){
  $('#barChart2').remove(); // this is my <canvas> element
  $('#sidebarContent').append('<canvas id="barChart2"><canvas>');
  canvas = document.querySelector('#barChart2');
  ctx = canvas.getContext('2d');
  ctx.canvas.width = $('#sidebarContent').width(); // resize to parent width
  ctx.canvas.height = 175; // resize to parent height
  var x = canvas.width/2;
  var y = canvas.height/2;
  ctx.font = '10pt Verdana';
  ctx.textAlign = 'center';
};
var resetCanvas3 = function(){
  $('#barChart3').remove(); // this is my <canvas> element
  $('#sidebarContent').append('<canvas id="barChart3"><canvas>');
  canvas = document.querySelector('#barChart3');
  ctx = canvas.getContext('2d');
  ctx.canvas.width = $('#sidebarContent').width(); // resize to parent width
  ctx.canvas.height = 175; // resize to parent height
  var x = canvas.width/2;
  var y = canvas.height/2;
  ctx.font = '10pt Verdana';
  ctx.textAlign = 'center';
};

var resetCanvas4 = function(){
  $('#barChart4').remove(); // this is my <canvas> element
  $('#sidebarContent').append('<canvas id="barChart4"><canvas>');
  canvas = document.querySelector('#barChart4');
  ctx = canvas.getContext('2d');
  ctx.canvas.width = $('#sidebarContent').width(); // resize to parent width
  ctx.canvas.height = 175; // resize to parent height
  var x = canvas.width/2;
  var y = canvas.height/2;
  ctx.font = '10pt Verdana';
  ctx.textAlign = 'center';
};
var removetext = function(){
  $("#sidebarText").remove()
}
var recovertext = function(){
  $("#sidebarContent").append('<UL id="sidebarText" type= "disc" style="width: 100%"></UL>')
  $('#sidebarText').append(' <LI class="YearText">Built Year: <span class="maxyearbuilt"></span> >(=) <span class="middleyearbuilt"></span> >(=) <span class="minyearbuilt"></span> </LI>');
  $('#sidebarText').append('<LI class="PersonalValueText">Personal Property Value: <span class="maxppv"></span> >(=) <span class="middleppv"></span> >(=) <span class="minppv"></span></LI>');
  $('#sidebarText').append('<LI class="LandValueText">Land Value: <span class="maxlv"></span> >(=) <span class="middlelv"></span> >(=) <span class="minlv"></span></LI>');
  $('#sidebarText').append('<LI class="ImprovementValueText">Improvement Value: <span class="maxiv"></span> >(=) <span class="middleiv"></span> >(=) <span class="miniv"></span></LI>');
}
var resettext1 = function(){
  $('.YearText').remove(); // this is my <canvas> element
  $('#sidebarText').append(' <LI class="YearText">Built Year: <span class="maxyearbuilt"></span> >(=) <span class="middleyearbuilt"></span> >(=) <span class="minyearbuilt"></span> </LI>');
};

var resettext2 = function(){
  $('.PersonalValueText').remove(); // this is my <canvas> element
  $('#sidebarText').append('<LI class="PersonalValueText">Personal Property Value: <span class="maxppv"></span> >(=) <span class="middleppv"></span> >(=) <span class="minppv"></span></LI>');
};

var resettext3 = function(){
  $('.LandValueText').remove(); // this is my <canvas> element
  $('#sidebarText').append('<LI class="LandValueText">Land Value: <span class="maxlv"></span> >(=) <span class="middlelv"></span> >(=) <span class="minlv"></span></LI>');
};

var resettext4 = function(){
  $('.ImprovementValueText').remove(); // this is my <canvas> element
  $('#sidebarText').append('<LI class="ImprovementValueText">Improvement Value: <span class="maxiv"></span> >(=) <span class="middleiv"></span> >(=) <span class="miniv"></span></LI>');
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

function makeBuffer3 (data){
  return data.map(function(a){
    if(a.properties.City == "San Francisco"){
      var stationPoint = turf.point([a.geometry.coordinates[0],a.geometry.coordinates[1]]);
      var stationBuffer3 = turf.buffer(stationPoint, 2, {units: 'miles'});
      return stationBuffer3
    }
  })
}

function leafletBuffer3 (bufferFeature) {
  return bufferFeature.map(function(a){
  console.log("buffer3 is now a geoJSON", L.geoJSON(a, {color: '#E6DBE2'}))
  return L.geoJSON(a, {color: '#E6DBE2'})
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
  removetext();
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

  Buffer3 = makeBuffer3(stationData);
  Buffer3 = Buffer3.filter(function(x){
    return x!==undefined
  })
  Buffer3geojson = leafletBuffer3(Buffer3);

  plotStationBuffer(Buffer1geojson);
  plotStationBuffer(Buffer2geojson);
  plotStationBuffer(Buffer3geojson);
  
  ///* Turn buffer into feature collection *///
  Buffer1FC = turf.featureCollection(Buffer1);
  Buffer2FC = turf.featureCollection(Buffer2);
  Buffer3FC = turf.featureCollection(Buffer3);
 

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
    resetCanvas3();
    resetCanvas4();
    removetext();
    recovertext();
    resettext1();
    resettext2();
    resettext3();
    resettext4();
    ptsArray=[];
    yearvalues1=[];
    yearvalues2=[];
    yearvalues3=[];
    PPVvalues1 = [];
    PPVvalues2 = [];
    PPVvalues3 = [];
    LVvalues1 = [];
    LVvalues2 = [];
    LVvalues3 = [];
    IVvalues1 = [];
    IVvalues2 = [];
    IVvalues3 = [];
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
      var yearBuiltc3 = turf.collect(Buffer3FC, pointFC, 'yearBuilt', 'yearBuiltValue');
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

      for (i=0;i<yearBuiltc3.features.length;i++){
        if(yearBuiltc3.features[i].properties.yearBuiltValue.length!==0){
          for(j=0;j<yearBuiltc3.features[i].properties.yearBuiltValue.length;j++){
            yearvalues3.push(yearBuiltc3.features[i].properties.yearBuiltValue[j]) 
          }
        }
      }
      var values3 = yearvalues3;
      values3 = values3.filter(function(x){
        return x!==undefined
      })
      for (i=0;i<values3.length;i++){
        values3[i] = Number(values3[i]);
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

      if(values3.length === 0){
        var buf3Stat = 0;
      }else{
        var buf3Stat = math.round(math.mean(values3));
      }
      ///* Text Generate *///

      if(values1.length===0 & values2.length===0 & values3.length===0){
        $('.YearText').text('')
      }
      else if (values1.length!==0 || values2.length!==0 || values3.length!==0){
        var valuearray = [buf1Stat,buf2Stat,buf3Stat];
        var maxvalue = math.max(...valuearray);
        var minvalue = math.min(...valuearray);
        if (buf1Stat ===maxvalue){
          $('.maxyearbuilt').text('0.5 mile buffer');
          if (buf2Stat === minvalue){
            $('.minyearbuilt').text('1 mile buffer');
            $('.middleyearbuilt').text('2 miles buffer');
          }else {
            $('.minyearbuilt').text('2 miles buffer');
            $('.middleyearbuilt').text('1 mile buffer');
          }
        }else if (buf2Stat ===maxvalue){
          $('.maxyearbuilt').text('1 mile buffer');
          if(buf1Stat === minvalue){
            $('.minyearbuilt').text('0.5 mile buffer');
            $('.middleyearbuilt').text('2 miles buffer');
          }else {
            $('.minyearbuilt').text('2 miles buffer');
            $('.middleyearbuilt').text('0.5 mile buffer');
          }
        }else if (buf3Stat ===maxvalue){
          $('.maxyearbuilt').text('2 miles buffer');
          if (buf1Stat === minvalue){
            $('.minyearbuilt').text('0.5 mile buffer');
            $('.middleyearbuilt').text('1 miles buffer');
          }else {
            $('.minyearbuilt').text('1 mile buffer');
            $('.middleyearbuilt').text('0.5 miles buffer');
          }
        }

        
      }

      

      
      
      //* personal Property Value *//
      var PPVc1 = turf.collect(Buffer1FC, pointFC, 'Personal_Property_Value', 'Personal_Property_Value');
      var PPVc2 = turf.collect(Buffer2FC, pointFC, 'Personal_Property_Value', 'Personal_Property_Value');
      var PPVc3 = turf.collect(Buffer3FC, pointFC, 'Personal_Property_Value', 'Personal_Property_Value');
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
        ppvvalues2[i] = Number(ppvvalues2[i]);
      }


      for (i=0;i<PPVc3.features.length;i++){
        if(PPVc3.features[i].properties.Personal_Property_Value.length!==0){
          for(j=0;j<PPVc3.features[i].properties.Personal_Property_Value.length;j++){
            PPVvalues3.push(PPVc3.features[i].properties.Personal_Property_Value[j]) 
          }
        }
      }
      var ppvvalues3 = PPVvalues3.filter(function(x){
        return x!==undefined
      })
      for (i=0;i<ppvvalues3.length;i++){
        ppvvalues3[i] = Number(ppvvalues3[i]);
      }
      console.log("values for one of the 8 bart stations", ppvvalues1, ppvvalues2,ppvvalues3) 

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

      if(ppvvalues3.length === 0){
        var buf3Stat2 = 0;
      }else{
        var buf3Stat2= math.round(math.mean(ppvvalues3));

      }

      ///* text generate*///

      if(ppvvalues1.length===0 & ppvvalues2.length===0 & ppvvalues3.length===0){
        $('.PersonalValueText').text('')
      }
      else if (ppvvalues1.length!==0 || ppvvalues2.length!==0 || ppvvalues3.length!==0){
        var valuearray = [buf1Stat2,buf2Stat2,buf3Stat2];
        var maxvalue = math.max(...valuearray);
        var minvalue = math.min(...valuearray);
        if (buf1Stat2 ===maxvalue){
          $('.maxppv').text('0.5 mile buffer');
          if (buf2Stat2 === minvalue){
            $('.minppv').text('1 mile buffer');
            $('.middleppv').text('2 miles buffer');
          }else {
            $('.minppv').text('2 miles buffer');
            $('.middleppv').text('1 mile buffer');
          }
        }else if (buf2Stat2 ===maxvalue){
          $('.maxppv').text('1 mile buffer');
          if(buf1Stat2 === minvalue){
            $('.minppv').text('0.5 mile buffer');
            $('.middleppv').text('2 miles buffer');
          }else {
            $('.minppv').text('2 miles buffer');
            $('.middleppv').text('0.5 mile buffer');
          }
        }else if (buf3Stat2 ===maxvalue){
          $('.maxppv').text('2 miles buffer');
          if (buf1Stat2 === minvalue){
            $('.minppv').text('0.5 mile buffer');
            $('.middleppv').text('1 miles buffer');
          }else {
            $('.minppv').text('1 mile buffer');
            $('.middleppv').text('0.5 miles buffer');
          }
        }

        
      }

      //* Land Value *//
      var LVc1 = turf.collect(Buffer1FC, pointFC, 'Land_Value', 'Land_Value');
      var LVc2 = turf.collect(Buffer2FC, pointFC, 'Land_Value', 'Land_Value');
      var LVc3 = turf.collect(Buffer3FC, pointFC, 'Land_Value', 'Land_Value');
      console.log("LVc1", LVc1);
      console.log("LVc2", LVc2);
      for (i=0;i<LVc1.features.length;i++){
        if(LVc1.features[i].properties.Land_Value.length!==0){
          for(j=0;j<LVc1.features[i].properties.Land_Value.length;j++){
            LVvalues1.push(LVc1.features[i].properties.Land_Value[j]) 
          }
        }
      }
      var lvvalues1 = LVvalues1.filter(function(x){
        return x!==undefined
      })
      for (i=0;i<lvvalues1.length;i++){
        lvvalues1[i] = Number(lvvalues1[i]);
      }


      for (i=0;i<LVc2.features.length;i++){
        if(LVc2.features[i].properties.Land_Value.length!==0){
          for(j=0;j<LVc2.features[i].properties.Land_Value.length;j++){
            LVvalues2.push(LVc2.features[i].properties.Land_Value[j]) 
          }
        }
      }
      var lvvalues2 = LVvalues2.filter(function(x){
        return x!==undefined
      })
      for (i=0;i<lvvalues2.length;i++){
        lvvalues2[i] = Number(lvvalues2[i]);
      }

      for (i=0;i<LVc3.features.length;i++){
        if(LVc3.features[i].properties.Land_Value.length!==0){
          for(j=0;j<LVc3.features[i].properties.Land_Value.length;j++){
            LVvalues3.push(LVc3.features[i].properties.Land_Value[j]) 
          }
        }
      }
      var lvvalues3 = LVvalues3.filter(function(x){
        return x!==undefined
      })
      for (i=0;i<lvvalues3.length;i++){
        lvvalues3[i] = Number(lvvalues3[i]);
      }

      console.log("values for one of the 8 bart stations", lvvalues1, lvvalues2) 

      if (lvvalues1.length===0){
        var buf1Stat3 = 0;
      } else {
        var buf1Stat3 = math.round(math.mean(lvvalues1));
      }

      if(lvvalues2.length === 0){
        var buf2Stat3 = 0;
      }else{
        var buf2Stat3= math.round(math.mean(lvvalues2));

      }

      if(lvvalues3.length === 0){
        var buf3Stat3 = 0;
      }else{
        var buf3Stat3= math.round(math.mean(lvvalues3));

      }

      ///* text generate *///

      if(lvvalues1.length===0 & lvvalues2.length===0 & lvvalues3.length===0){
        $('.LandValueText').text('')
      }
      else if (lvvalues1.length!==0 || lvvalues2.length!==0 || lvvalues3.length!==0){
        var valuearray = [buf1Stat3,buf2Stat3,buf3Stat3];
        var maxvalue = math.max(...valuearray);
        var minvalue = math.min(...valuearray);
        if (buf1Stat3 ===maxvalue){
          $('.maxlv').text('0.5 mile buffer');
          if (buf2Stat3 === minvalue){
            $('.minlv').text('1 mile buffer');
            $('.middlelv').text('2 miles buffer');
          }else {
            $('.minlv').text('2 miles buffer');
            $('.middlelv').text('1 mile buffer');
          }
        }else if (buf2Stat3 ===maxvalue){
          $('.maxlv').text('1 mile buffer');
          if(buf1Stat3 === minvalue){
            $('.minlv').text('0.5 mile buffer');
            $('.middlelv').text('2 miles buffer');
          }else {
            $('.minlv').text('2 miles buffer');
            $('.middlelv').text('0.5 mile buffer');
          }
        }else if (buf3Stat3 ===maxvalue){
          $('.maxlv').text('2 miles buffer');
          if (buf1Stat3 === minvalue){
            $('.minlv').text('0.5 mile buffer');
            $('.middlelv').text('1 miles buffer');
          }else {
            $('.minlv').text('1 mile buffer');
            $('.middlelv').text('0.5 miles buffer');
          }
        }

        
      }


      //* Improvement Value *//
      var IVc1 = turf.collect(Buffer1FC, pointFC, 'Improvement_Value', 'Improvement_Value');
      var IVc2 = turf.collect(Buffer2FC, pointFC, 'Improvement_Value', 'Improvement_Value');
      var IVc3 = turf.collect(Buffer3FC, pointFC, 'Improvement_Value', 'Improvement_Value');
      console.log("IVc1", IVc1);
      console.log("IVc2", IVc2);
      console.log("IVc3", IVc3);
      for (i=0;i<IVc1.features.length;i++){
        if(IVc1.features[i].properties.Improvement_Value.length!==0){
          for(j=0;j<IVc1.features[i].properties.Improvement_Value.length;j++){
            IVvalues1.push(IVc1.features[i].properties.Improvement_Value[j]) 
          }
        }
      }
      var ivvalues1 = IVvalues1.filter(function(x){
        return x!==undefined
      })
      for (i=0;i<ivvalues1.length;i++){
        ivvalues1[i] = Number(ivvalues1[i]);
      }


      for (i=0;i<IVc2.features.length;i++){
        if(IVc2.features[i].properties.Improvement_Value.length!==0){
          for(j=0;j<IVc2.features[i].properties.Improvement_Value.length;j++){
            IVvalues2.push(IVc2.features[i].properties.Improvement_Value[j]) 
          }
        }
      }
      var ivvalues2 = IVvalues2.filter(function(x){
        return x!==undefined
      })
      for (i=0;i<ivvalues2.length;i++){
        ivvalues2[i] = Number(ivvalues2[i]);
      }


      for (i=0;i<IVc3.features.length;i++){
        if(IVc3.features[i].properties.Improvement_Value.length!==0){
          for(j=0;j<IVc3.features[i].properties.Improvement_Value.length;j++){
            IVvalues3.push(IVc3.features[i].properties.Improvement_Value[j]) 
          }
        }
      }
      var ivvalues3 = IVvalues3.filter(function(x){
        return x!==undefined
      })
      for (i=0;i<ivvalues3.length;i++){
        ivvalues3[i] = Number(ivvalues3[i]);
      }
      console.log("values for one of the 8 bart stations", ivvalues1, ivvalues2, ivvalues3) 

      if (ivvalues1.length===0){
        var buf1Stat4 = 0;
      } else {
        var buf1Stat4 = math.round(math.mean(ivvalues1));
      }

      if(ivvalues2.length === 0){
        var buf2Stat4 = 0;
      }else{
        var buf2Stat4= math.round(math.mean(ivvalues2));

      }

      if(ivvalues3.length === 0){
        var buf3Stat4 = 0;
      }else{
        var buf3Stat4= math.round(math.mean(ivvalues3));

      }

      ///*text generate*///

   
      if(ivvalues1.length===0 & ivvalues2.length===0 & ivvalues3.length===0){
        $('.ImprovementValueText').text('')
      }
      else if (ivvalues1.length!==0 || ivvalues2.length!==0 || ivvalues3.length!==0){
        var valuearray = [buf1Stat4,buf2Stat4,buf3Stat4];
        var maxvalue = math.max(...valuearray);
        var minvalue = math.min(...valuearray);
        if (buf1Stat4 ===maxvalue){
          $('.maxiv').text('0.5 mile buffer');
          if (buf2Stat3 === minvalue){
            $('.miniv').text('1 mile buffer');
            $('.middleiv').text('2 miles buffer');
          }else {
            $('.miniv').text('2 miles buffer');
            $('.middleiv').text('1 mile buffer');
          }
        }else if (buf2Stat4 ===maxvalue){
          $('.maxiv').text('1 mile buffer');
          if(buf1Stat4 === minvalue){
            $('.miniv').text('0.5 mile buffer');
            $('.middleiv').text('2 miles buffer');
          }else {
            $('.miniv').text('2 miles buffer');
            $('.middleiv').text('0.5 mile buffer');
          }
        }else if (buf3Stat4 ===maxvalue){
          $('.maxiv').text('2 miles buffer');
          if (buf1Stat4 === minvalue){
            $('.miniv').text('0.5 mile buffer');
            $('.middleiv').text('1 miles buffer');
          }else {
            $('.miniv').text('1 mile buffer');
            $('.middleiv').text('0.5 miles buffer');
          }
        }

        
      }



     

      ///* CHART *///
        // bar chart
        ctxBar = $("#barChart");
        barChart = new Chart(ctxBar, {
          type: "bar",
          data: {
            labels: ["within 0.5 mile distance", "within 1 mile distance", "within 2 miles distance"],
            datasets: [
              {
                data: [
                  buf1Stat,
                  buf2Stat,
                  buf3Stat,
                ],
                backgroundColor: [
                  "rgba(151, 127, 140, 1)",
                  "rgba(208, 188, 202, 1)",
                  "rgba(230, 219, 226, 1)",
                ],
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: false,
                min: 1900
              },
            },
            plugins: {
              title: {
                display: true,
                text: "Average Built Year of Property",
              },
              legend:{
                display: false
              }
            }
          },
        }); 
   
        ctxBar2 = $("#barChart2");
        barChart2 = new Chart(ctxBar2, {
          type: "bar",
          data: {
            labels: ["within 0.5 mile distance", "within 1 mile distance","within 2 miles distance"],
            datasets: [
              {
                data: [
                  buf1Stat2,
                  buf2Stat2,
                  buf3Stat2,
                ],
                backgroundColor: [
                  "rgba(151, 127, 140, 1)",
                  "rgba(208, 188, 202, 1)",
                  "rgba(230, 219, 226, 1)",
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
            plugins: {
              title: {
                display: true,
                text: "Average Personal Property Value",
              },
              legend:{
                display: false
              }
          }
        }
        }); 

        ctxBar3 = $("#barChart3");
        barChart3 = new Chart(ctxBar3, {
          type: "bar",
          data: {
            labels: ["within 0.5 mile distance", "within 1 mile distance","whithin 2 miles distance"],
            datasets: [
              {
                data: [
                  buf1Stat3,
                  buf2Stat3,
                  buf3Stat3,
                ],
                backgroundColor: [
                  "rgba(151, 127, 140, 1)",
                  "rgba(208, 188, 202, 1)",
                  "rgba(230, 219, 226, 1)",
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
            plugins: {
              title: {
                display: true,
                text: "Average Land Value",
              },
              legend:{
                display: false
              }
          }
          },
        }); 

        ctxBar4 = $("#barChart4");
        barChart4 = new Chart(ctxBar4, {
          type: "bar",
          data: {
            labels: ["within 0.5 mile distance", "within 1 mile distance","whithin 2 miles distance"],
            datasets: [
              {
                data: [
                  buf1Stat4,
                  buf2Stat4,
                  buf3Stat4,
                ],
                backgroundColor: [
                  "rgba(151, 127, 140, 1)",
                  "rgba(208, 188, 202, 1)",
                  "rgba(230, 219, 226, 1)",
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
            plugins: {
              title: {
                display: true,
                text: "Average Improvement Value",
              },
              legend:{
                display: false
              }
          }
          },
        }); 

     

    })
      

  })  ;




})
