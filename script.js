// create the map and display it on the page
mapboxgl.accessToken = 'pk.eyJ1IjoiYXlvdWIyMjExIiwiYSI6ImNsM3o2N3U2dzBreHkza3F3dm8yMnRkaTgifQ.QcyJ9B6_e5S93W3EgInZyQ';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-74.5, 40], // starting position
    zoom: 9 // starting zoom
});

// add an event listener to the map to get the latitude and longitude of a clicked location
map.on('click', function(e) {
    // extract the latitude and longitude of the clicked location
    var lngLat = e.lngLat;
    
    // show the input form and populate the latitude and longitude fields
    document.getElementById('marker-form').style.display = 'block';
    document.getElementById('latitude').value = lngLat.lat.toFixed(4);
    document.getElementById('longitude').value = lngLat.lng.toFixed(4);
});

// create an array to store the marker data
var mapData = [];

// add an event listener to the form submit button to add a new marker to the map
document.getElementById('submit').addEventListener('click', function(e) {
    e.preventDefault();
    
    // extract the form data
    var name = document.getElementById('name').value;
    var description = document.getElementById('description').value;
    var latitude = document.getElementById('latitude').value;
    var longitude = document.getElementById('longitude').value;
    
    // create a new marker and add it to the map
    var marker = new mapboxgl.Marker()
        .setLngLat([longitude, latitude])
        .setPopup(new mapboxgl.Popup({ offset: 25 })
        .setHTML('<h3>' + name + '</h3><p>' + description + '</p>'))
        .addTo(map);
    
    // add the marker data to the array
    mapData.push({name: name, description: description, latitude: latitude, longitude: longitude});
    
    // hide the input form
    document.getElementById('marker-form').style.display = 'none';
    
    // clear the form fields
    document.getElementById('name').value = '';
    document.getElementById('description').value = '';
    document.getElementById('latitude').value = '';
    document.getElementById('longitude').value = '';
});

// create a source using the saved data and add a layer for each unique name in the data
map.on('load', function() {
    map.addSource('markers', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: mapData.map(function(marker) {
                return {
                    type: 'Feature',
                    properties: {
                        name: marker.name,
                        description: marker.description,
                        fill: '#FF0000' // default fill color
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [marker.longitude, marker.latitude]
                    }
                };
            })
        }
    });
    
    // get an array of unique names in the data
    var uniqueNames = [...new Set(mapData.map(function(marker) { return marker.name; }))];

    // add a layer for each unique name in the data
    uniqueNames.forEach(function(name) {
        map.addLayer({
            id: name,
            type: 'fill',
            source: 'markers',
            filter: ['==', ['get', 'name'], name],
            paint: {
                'fill-color': ['get', 'fill'],
                'fill-opacity': 0.5
            }
        });
    });
});

// add an event listener to the layer list checkboxes to toggle the visibility of the layers
var layerList = document.getElementById('layer-list');
layerList.addEventListener('change', function(e) {
var layerId = e.target.value;
var isChecked = e.target.checked;

// toggle the visibility of the layer based on the checkbox state
map.setLayoutProperty(layerId, 'visibility', isChecked ? 'visible' : 'none');
});

// create a search box
var searchBox = new MapboxGeocoder({
accessToken: mapboxgl.accessToken,
mapboxgl: mapboxgl,
placeholder: 'Search for a location...',
countries: 'us,ca',
marker: false
});

// add the search box to the map
map.addControl(searchBox, 'top-left');

// add an event listener to the search box to center the map on the selected location
searchBox.on('result', function(e) {
map.flyTo({
center: e.result.center,
zoom: 15
});
});

// add an event listener to the form to add a marker to the map when the user submits the form
var form = document.getElementById('marker-form');
form.addEventListener('submit', function(e) {
e.preventDefault();

// get the form data
var name = document.getElementById('name').value;
var description = document.getElementById('description').value;
var lat = document.getElementById('lat').value;
var lng = document.getElementById('lng').value;

// create a new marker and popup
var marker = new mapboxgl.Marker()
.setLngLat([lng, lat])
.addTo(map);

var popup = new mapboxgl.Popup({ offset: 25 })
.setHTML('<h3>' + name + '</h3><p>' + description + '</p>');

marker.setPopup(popup);

// add the data to the mapData array
mapData.push({ name: name, description: description, lat: lat, lng: lng });

// update the layer based on the updated mapData array
updateLayer();

// clear the form
document.getElementById('name').value = '';
document.getElementById('description').value = '';
document.getElementById('lat').value = '';
document.getElementById('lng').value = '';
});

// add an event listener to the map to show the form when the user clicks on a location
map.on('click', function(e) {
// show the form
document.getElementById('marker-form-container').style.display = 'block';

// set the lat and lng values in the form
document.getElementById('lat').value = e.lngLat.lat;
document.getElementById('lng').value = e.lngLat.lng;
});

// update the layer based on the mapData array
function updateLayer() {
// create the GeoJSON feature collection for the source
var features = [];
for (var i = 0; i < mapData.length; i++) {
var data = mapData[i];
features.push({
type: 'Feature',
geometry: {
type: 'Point',
coordinates: [data.lng, data.lat]
},
properties: {
name: data.name,
description: data.description
}
});
}

var source = map.getSource('markers');
if (source) {
// update the source data
source.setData({
type: 'FeatureCollection',
features: features
});
