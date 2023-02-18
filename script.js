// Create map object
mapboxgl.accessToken = 'pk.eyJ1IjoiYXlvdWIyMjExIiwiYSI6ImNsM3o2N3U2dzBreHkza3F3dm8yMnRkaTgifQ.QcyJ9B6_e5S93W3EgInZyQ';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-122.4, 37.8],
    zoom: 10
});

// Initialize mapData array
var mapData = [];

// Add marker on click
map.on('click', function(e) {
    // Get coordinates of clicked location
    var coordinates = e.lngLat;

    // Show input form
    document.getElementById('data-form').style.display = 'block';

    // Clear form fields
    document.getElementById('latitude').value = coordinates.lat.toFixed(4);
    document.getElementById('longitude').value = coordinates.lng.toFixed(4);
    document.getElementById('name1').value = '';
    document.getElementById('description1').value = '';

    // Remove previous form fields
    var nameDescriptionFields = document.getElementById('name-description-fields');
    while (nameDescriptionFields.firstChild) {
        nameDescriptionFields.removeChild(nameDescriptionFields.firstChild);
    }

    // Add name/description input fields
    var numFields = parseInt(document.getElementById('num-fields').value);
    for (var i = 1; i <= numFields; i++) {
        var nameInput = document.createElement('input');
        nameInput.setAttribute('type', 'text');
        nameInput.setAttribute('id', 'name' + i);
        nameInput.setAttribute('placeholder', 'Name ' + i);
        nameDescriptionFields.appendChild(nameInput);

        var descriptionInput = document.createElement('input');
        descriptionInput.setAttribute('type', 'text');
        descriptionInput.setAttribute('id', 'description' + i);
        descriptionInput.setAttribute('placeholder', 'Description ' + i);
        nameDescriptionFields.appendChild(descriptionInput);
    }
});

// Add data to map and mapData array
var addData = function(data) {
    mapData.push(data);
    map.addSource('markers', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: mapData
        }
    });
    var uniqueNames = getUniqueNames();
    uniqueNames.forEach(function(name) {
        map.addLayer({
            id: name,
            type: 'fill',
            source: 'markers',
            filter: ['==', 'name', name],
            paint: {
                'fill-color': ['get', 'color'],
                'fill-opacity': 0.8
            }
        });
    });
};

// Get array of unique names in mapData
var getUniqueNames = function() {
    var uniqueNames = [];
    mapData.forEach(function(feature) {
        var name = feature.properties.name;
        if (!uniqueNames.includes(name)) {
            uniqueNames.push(name);
        }
    });
    return uniqueNames;
};

// Hide/show layer based on name
var toggleLayer = function(name, visibility) {
    if (map.getLayer(name)) {
        map.setLayoutProperty(name, 'visibility', visibility);
    }
};

// Hide/show all layers
var toggleAllLayers = function(visibility) {
    var uniqueNames = getUniqueNames();
    uniqueNames.forEach(function(name) {
        toggleLayer(name, visibility);
    });
};

// Add new name/description input fields to the form
var addNameDescriptionFields = function() {
    var nameDescriptionFields = document.getElementById('name-description-fields');
    var numFields = nameDescriptionFields.childElementCount / 2;
    var nameInput = document.createElement('input');
    nameInput.setAttribute('type', 'text');
    nameInput.setAttribute('id', 'name' + (numFields + 1));
    nameInput.setAttribute('placeholder', 'Name ' + (numFields + 1));
    nameDescriptionFields.appendChild(nameInput);

    var descriptionInput = document.createElement('input');
    descriptionInput.setAttribute('type', 'text');
    descriptionInput.setAttribute('id', 'description' + (numFields + 1));
    descriptionInput.setAttribute('placeholder', 'Description ' + (numFields + 1));
    nameDescriptionFields.appendChild(descriptionInput);
};

// Add event listener for "Add Name/Description Pair" button
var addFieldsButton = document.getElementById('add-fields-button');
addFieldsButton.addEventListener('click', addNameDescriptionFields);


// Event listener for "Add Marker" button
document.getElementById('submit-button').addEventListener('click', function(e) {
    e.preventDefault();
    var coordinates = {
        'lng': parseFloat(document.getElementById('longitude').value),
        'lat': parseFloat(document.getElementById('latitude').value)
    };
  var properties = {};
    var numFields = parseInt(document.getElementById('num-fields').value);
    for (var i = 1; i <= numFields; i++) {
        var name = document.getElementById('name' + i).value;
        var description = document.getElementById('description' + i).value;
        if (name && description) {
            properties[name] = description;
        }
    }
    var data = {
        'type': 'Feature',
        'geometry': {
            'type': 'Point',
            'coordinates': [coordinates.lng, coordinates.lat]
        },
        'properties': properties
    };
    addData(data);
    toggleAllLayers('visible');
    document.getElementById('data-form').style.display = 'none';
});

// Event listener for "Cancel" button
document.getElementById('cancel-button').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('data-form').style.display = 'none';
});

// Event listener for "Show/Hide Layer" buttons
var toggleButtons = document.querySelectorAll('.toggle-button');
toggleButtons.forEach(function(button) {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        var name = this.dataset.name;
        var visibility = this.dataset.visibility === 'visible' ? 'none' : 'visible';
        toggleLayer(name, visibility);
        this.dataset.visibility = visibility;
        this.textContent = visibility === 'visible' ? 'Hide' : 'Show';
    });
});
