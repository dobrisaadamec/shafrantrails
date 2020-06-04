
function getQueryVariable(url, variable) {
  var query = url.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (pair[0] == variable) {
      return pair[1];
    }
  }

  return false;
}

function animateSidebar() {
  $("#sidebar").animate({
    width: "toggle"
  }, 350, function () {
    map.invalidateSize();
  });
}

function sizeLayerControl() {
  $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

function clearHighlight() {
  highlight.clearLayers();
}

function sidebarClick(id) {
  var layer = markerClusters.getLayer(id);
  map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
  layer.fire("click");
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

function setOpenMap() {
  map.removeLayer(mapLayerOpenTopoMap);
  map.removeLayer(mapLayerEsriWorldImagery);
  map.removeLayer(mapLayerGoogleHybrid);

  map.addLayer(mapLayerOpenStreetMap);
}

function setTopoMap() {
  map.removeLayer(mapLayerOpenStreetMap);
  map.removeLayer(mapLayerEsriWorldImagery);
  map.removeLayer(mapLayerGoogleHybrid);
  map.removeLayer(mapLayerGoogleTerain);

  map.addLayer(mapLayerOpenTopoMap);
}

function setESRIMap() {
  map.removeLayer(mapLayerOpenStreetMap);
  map.removeLayer(mapLayerOpenTopoMap);
  map.removeLayer(mapLayerGoogleHybrid);
  map.removeLayer(mapLayerGoogleTerain);

  map.addLayer(mapLayerEsriWorldImagery);
}

function setGoogleHybridMap() {
  map.removeLayer(mapLayerOpenStreetMap);
  map.removeLayer(mapLayerOpenTopoMap);
  map.removeLayer(mapLayerEsriWorldImagery);
  map.removeLayer(mapLayerGoogleTerain);

  map.addLayer(mapLayerGoogleHybrid);
}

function setGoogleTerainMap() {
  map.removeLayer(mapLayerOpenStreetMap);
  map.removeLayer(mapLayerOpenTopoMap);
  map.removeLayer(mapLayerEsriWorldImagery);
  map.removeLayer(mapLayerGoogleHybrid);

  map.addLayer(mapLayerGoogleTerain);
}

function showRouteModalInfo(name, gpxLayer, url, additionalInfo) {

  $("#routeModal").modal("show");
  $('#routeName').text(name);
  var info = '<p>Dužina: ' + (gpxLayer.get_distance() / 1000).toFixed(2) + 'km</p>';
  info = info + '<p>Ukupna visinske: ' + (gpxLayer.get_elevation_gain() != 'null' ? gpxLayer.get_elevation_gain().toFixed(0) + 'm' : '-') + '</p>';
  info = info + '<p>Min visina: ' + (gpxLayer.get_elevation_min() != null ? gpxLayer.get_elevation_min().toFixed(0) + 'm' : '0m') + '</p>';
  info = info + '<p>Max visina: ' + (gpxLayer.get_elevation_max() != null ? gpxLayer.get_elevation_max().toFixed(0) + 'm' : '-') + '</p>';
  info = info + '<p>Vrijeme traga: ' + (gpxLayer.get_total_time() != 'null' ? gpxLayer.get_duration_string_iso(gpxLayer.get_total_time(), false) : '-') + '</p>';
  if (additionalInfo.length > 0) {
    info = info + '<hr/>' + additionalInfo;
  }
  if (url.length > 0) {
    info = info + '<hr/><p>Upute: <a href="' + url + '" target="_blank">upute<a/>'
  }

  $('#routeInfo').html(info);
}

function toggleRoute(el, layer) {

  if (map.hasLayer(layer)) {
    map.removeLayer(layer);
    //children(":first")
    $(el).removeClass("fa-check-circle");
    $(el).addClass("fa-circle-o");
  } else {
    map.addLayer(layer);
    $(el).removeClass("fa-circle-o");
    $(el).addClass("fa-check-circle");

    map.fitBounds(layer.getBounds());
    //layer.reload();
  }

  function zoomRoute(layer) {
    map.fitBounds(layer.getBounds());
  }

  //elevation - gasi ako nije jedna
  if ($('.fa-check-circle').length > 1) {
    map.setView([45.4858, 15.5218], 13);
    hideElevationLayer();
  }
  if ($('.fa-check-circle').length == 0) {
    map.setView([45.4858, 15.5218], 13);
    hideElevationLayer();
  }


  return false;
}

function showSelectedLayer() {
  //eval(clickAllLayersScript);
  eval(`showElevationLayer('${selectedLayerGPX}');`);
  //eval(`$("#${selectedLayerMenuId}").click();`);
}

var elevationControls = new L.FeatureGroup();


function showElevationLayer(gpxPath) {
  // Instantiate elevation control.

  controlElevation.clear();
  // Load track from url (allowed data types: "*.geojson", "*.gpx")
  controlElevation.load(gpxPath);
  controlElevation.show();

}

function hideElevationLayer() {
  controlElevation.hide();
}

/* Attribution control */
function updateAttribution(e) {
  $.each(map._layers, function (index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html((layer.getAttribution()));
    }
  });
}

//init map and layers

var map;

$.ajaxSetup({
  async: false
});

$(window).resize(function () {
  sizeLayerControl();
});

$(document).on("click", ".feature-row", function (e) {
  $(document).off("mouseout", ".feature-row", clearHighlight);
  sidebarClick(parseInt($(this).attr("id"), 10));
});

if (!("ontouchstart" in window)) {
  $(document).on("mouseover", ".feature-row", function (e) {
    highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
  });
}

$(document).on("mouseout", ".feature-row", clearHighlight);

$("#about-btn").click(function () {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#full-extent-btn").click(function () {
  map.fitBounds(boroughs.getBounds());
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#legend-btn").click(function () {
  $("#legendModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#login-btn").click(function () {
  $("#loginModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#list-btn").click(function () {
  animateSidebar();
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#nav-btn").click(function () {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function () {
  animateSidebar();
  return false;
});

$("#sidebar-hide-btn").click(function () {
  animateSidebar();
  return false;
});

//init map

var elevation_options = {
  // Default chart colors: theme lime-theme, magenta-theme, ...
  theme: "lightblue-theme",
  // Chart container outside/inside map container
  detached: false,
  // if (detached), the elevation chart container
  elevationDiv: "#elevation-div",
  // if (!detached) autohide chart profile on chart mouseleave
  autohide: false,
  // if (!detached) initial state of chart profile control
  collapsed: false,
  // if (!detached) control position on one of map corners
  position: "bottomright",
  // Autoupdate map center on chart mouseover.
  followMarker: false,
  // Chart distance/elevation units.
  imperial: false,
  // [Lat, Long] vs [Long, Lat] points. (leaflet default: [Lat, Long])
  reverseCoords: false,
  // Summary track info style: "line" || "multiline" || false,
  summary: 'line',
  gpxOptions: {
    async: true,
    marker_options: {
      startIconUrl: null,
      endIconUrl: null,
      shadowUrl: null
    },
    polyline_options: {
      className: '',
      color: '#566B13',
      opacity: 1,
      weight: 0,
      lineCap: 'round'
    },
  },
};

map = L.map('map').setView([45.4858, 15.5218], 13);

// add the OpenStreetMap tiles
var mapLayerOpenStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
});

var mapLayerEsriWorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var mapLayerGoogleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
  maxZoom: 20,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

var mapLayerGoogleTerain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
  maxZoom: 20,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});


var mapLayerOpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(map);

//init layers
var trailsLayer;

var selectedLayerMenuId;
var selectedLayerGPX;

var createLayersScript = '';
var clickAllLayersScript = '';


var trailsDbData;

var trailLayersList = '';

$.getJSON("data/trailsdb.json.txt", function (data) {
  var htmlDownload = '';
  var htmlMenu = '';

  trailsDbData = data;

  $.each(data, function (key, value) {

    htmlDownload += `<li><a href="${value.gpx}" download="${value.downloadName}" target="_blank" data-toggle="collapse" data-target=".navbar-collapse.in"> 
      <i class="fa fa-download"></i>&nbsp;&nbsp;${value.name}</a>
      </li>`;
    htmlMenu += `<tr class="" style="cursor:pointer;">
      <td id="${value.menuId}"  onclick=" map.fitBounds(${value.layerName}.getBounds());" ></i>
      ${value.name}
      </td><td><i onclick="toggleRoute(this, ${value.layerName})" style="float:right; margin-right: 5px;color: #379863" 
      class="fa fa-2x fa-check-circle"></i></td>
    </tr>`;

    createLayersScript += `var ${value.layerName} = new L.GPX('${value.gpx}', {
      name: '${value.layerName}',
      polyline_options: {
        color: '${value.color}',
        opacity: 0.75,
        weight: 5,
        lineCap: 'round'
      },
      async: true,
      marker_options: {
        startIconUrl: 'assets/img/pin-icon-start.png',
        endIconUrl: 'assets/img/pin-icon-end.png',
        shadowUrl: 'assets/img/pin-shadow.png'
      }
    }).on('loaded', function (e) {
      //map.fitBounds(e.target.getBounds());
    });
  
    ${value.layerName}.on('click', function (e) {
      selectedLayerMenuId = '${value.menuId}';
      selectedLayerGPX = '${value.gpx}';
      showRouteModalInfo('${value.name}', this, '${value.infoUrl}', '${value.additionInfo}');
    });
    `
    clickAllLayersScript += `$("#${value.menuId}").click();`;

    createPOIlayerScript += `L.marker([45.477655, 15.533742], { icon: iconRedLeaf }).bindPopup("Ulaz AGM 1 (Poučna staza)<br/><img width='100%' src='assets/img/poi/agm1.jpg' />");`;

    trailLayersList += `${value.layerName}, `;
  });

  $('#menuTrailsDownload').html(htmlDownload);

  $('#menuTrails').html(htmlMenu);

});

eval(createLayersScript);

eval(`trailsLayer = L.featureGroup([${trailLayersList}]);`);

trailsLayer.addTo(map);

var iconGreenLeaf = L.icon({
  iconUrl: 'assets/img/leaf-green.png',
  shadowUrl: 'assets/img/leaf-shadow.png',

  iconSize: [38, 95], // size of the icon
  shadowSize: [50, 64], // size of the shadow
  iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
  shadowAnchor: [4, 62],  // the same for the shadow
  popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
});

var iconRedLeaf = L.icon({
  iconUrl: 'assets/img/leaf-red.png',
  shadowUrl: 'assets/img/leaf-shadow.png',

  iconSize: [38, 95], // size of the icon
  shadowSize: [50, 64], // size of the shadow
  iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
  shadowAnchor: [4, 62],  // the same for the shadow
  popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
});

iconCamera = L.divIcon({
  className: 'custom-div-icon',
  html: "<div style='background-color:#4838cc;' class='marker-pin'></div><i class='fa fa-camera awesome'>",
  iconSize: [40, 58],
  iconAnchor: [20, 58]
});

//ključne točke
var customOptions =
{
  'maxWidth': '500'
}

var createPOIlayerScript = '';
var poiLayers = '';
var POILayer;
$.getJSON("data/poidb.json.txt", function (data) {

  $.each(data, function (key, value) {

    createPOIlayerScript += `var ${value.code} = L.marker([${value.latitude}, ${value.longitude}], { icon: ${value.icon} }).bindPopup("${value.name} ${value.img}", customOptions);`;
    poiLayers += `${value.code}, `;
  });

  eval(createPOIlayerScript);
  eval(`POILayer = L.layerGroup([${poiLayers}]);`);
});

var controlElevation = L.control.elevation(elevation_options);
controlElevation.addTo(map);
hideElevationLayer();
//samo jedna odabrana
var routeName = getQueryVariable(window.location.search, 'name');
if (routeName.length > 0) {
  var selectedTrail = trailsDbData.find(x => x.code === routeName);
  if (selectedTrail != undefined) {
    eval(clickAllLayersScript);
    eval(`showElevationLayer('${selectedTrail.gpx}');`);
    eval(`$("#${selectedTrail.menuId}").click();`);
  }
}

$('#loading').hide();


var attributionControl = L.control({
  position: "bottomright"
});
attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML = "<span class='hidden-xs'>Developed by <a href='http://bryanmcbride.com'>bryanmcbride.com</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
// map.addControl(attributionControl);

// var zoomControl = L.control.zoom({
//   position: "bottomright"
// }).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "fa fa-location-arrow",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

$("#featureModal").on("hidden.bs.modal", function (e) {
  $(document).on("mouseout", ".feature-row", clearHighlight);
});

  // // Leaflet patch to make layer control scrollable on touch browsers
  // var container = $(".leaflet-control-layers")[0];
  // if (!L.Browser.touch) {
  //   L.DomEvent
  //     .disableClickPropagation(container)
  //     .disableScrollPropagation(container);
  // } else {
  //   L.DomEvent.disableClickPropagation(container);
  // }




