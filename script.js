const map = L.map('map', {
    // Initialise the map with default options
}).setView([31.771959, 35.217018], 13); // Coords for Jerusalem

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
// Define custom panes
map.createPane('isochronesPane');
map.createPane('linesPane');
map.createPane('stationsPane');
// Set z-index for each pane
map.getPane('isochronesPane').style.zIndex = 400; // Lower zIndex
map.getPane('linesPane').style.zIndex = 500; // Higher than isochronesPane
map.getPane('stationsPane').style.zIndex = 600; // Highest zIndex

const isochronesLayer = L.layerGroup().addTo(map);

// Show isochrones based on selected time range
function updateIsochrones(timeThresh) {
    // map.getPane('isochronesPane').clearGeoJSON();
    isochronesLayer.clearLayers();
    fetch('isochrones/jlem_lrt_dist_iso_reprojected.geojson')
        .then(response => response.json())
        .then(data => {
            const filteredFeatures = data.features.filter(feature => feature.properties.time <= timeThresh);
            L.geoJSON(filteredFeatures, {
                style: function(feature) {
                    return {
                        color: feature.properties.color || '#000000',
                        weight: 2,
                        opacity: 0.75
                    };
                },
                // pane: 'isochronesPane'
            }).addTo(isochronesLayer);
            addLegend(filteredFeatures);
        })
        .catch(error => console.error('Error loading isochrones GeoJSON:', error));
}

updateIsochrones(20); // Load all isochrones by default

// Event listener for time range selection
document.getElementById('timeThresh').addEventListener('change', function() {
    const selectedTimeThresh = parseInt(this.value);
    updateIsochrones(selectedTimeThresh);
});
// Load and add lines GeoJSON
fetch('data/jlem_lrt_lines_clr.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            style: function(feature) {
                return {
                    color: feature.properties.color || '#FF0000',
                    weight: 4,
                    opacity: 1.0
                };
            },
            pane: 'linesPane' // Set pane for lines
        }).addTo(map);
    })
    .catch(error => console.error('Error loading lines GeoJSON:', error));

// Load and add stations GeoJSON
fetch('data/jlem_lrt_stations.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            pointToLayer: function(feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: 6,
                    fillColor: '#000000',
                    color: '#FFFFFF',
                    weight: 1,
                    opacity: 0.6,
                    fillOpacity: 0.6,
                    pane: "stationsPane"
                });
            },
            onEachFeature: function(feature, layer) {
                if (feature.properties && feature.properties.Name) {
                    layer.bindTooltip('<b>' + feature.properties.Name + '</b>', { permanent: false, direction: 'top' });
                    layer.bindPopup('<b>' + feature.properties.Name + '</b>');
                }
            },
            pane: 'stationsPane' // Set pane for stations
        }).addTo(map);
    })
    .catch(error => console.error('Error loading stations GeoJSON:', error));

// Function to add the legend
function addLegend(features) {
    const legend = document.getElementById('legend-items');
    legend.innerHTML = '<h4>Walking Times</h4>';

    // Create a Map to store colors and their corresponding times
    const colourTime = new Map();

    features.reverse().forEach(feature => {
        const colour = feature.properties.color;
        const time = feature.properties.time;
        if (colour && time !== undefined) {
            colourTime.set(colour, time);
        }
    });

    // Create legend entries from the Map
    colourTime.forEach((time, colour) => {
        const div = document.createElement('div');
        div.innerHTML = '<span class="color-box" style="background-color: ' + colour + ';"></span>' + time + ' minutes';
        legend.appendChild(div);
    });
}