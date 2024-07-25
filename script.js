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
const linesLayer = L.layerGroup().addTo(map);

// Show isochrones based on selected time range
function updateIsochrones(timeThresh, line) {
    // map.getPane('isochronesPane').clearGeoJSON();
    isochronesLayer.clearLayers();
    console.log(line);
    const fname = line === "all" ?  `isochrones/jlem_lrt_dist_iso_reprojected.geojson` : `isochrones/jlem_lrt_dist_iso_${line}_reprojected.geojson`;
    fetch(fname)
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

updateIsochrones(20, 'all'); // Load all isochrones by default
updateLines("all"); //load all lines

// Event listener for time range selection
document.getElementById('timeThresh').addEventListener('change', function() {
    const selectedTimeThresh = parseInt(this.value);
    updateIsochrones(selectedTimeThresh, getLine());
    updateLines(getLine());
});

// Event listener for lines selection
document.getElementById('line-select').addEventListener('change', function() {
    const selectedLine = getLine();//this.value;
    updateIsochrones(parseInt(document.getElementById('timeThresh').value), selectedLine);
    updateLines(selectedLine);
});

function getLine() { //get the currently selected line
    const selectedOptions = Array.from(document.getElementById('line-select').selectedOptions);
    return selectedOptions.map(option => option.value)[0];
}
function updateLines(line) {
    // Load and add lines GeoJSON
    linesLayer.clearLayers();
    fetch('data/jlem_lrt_lines_clr.geojson')
    .then(response => response.json())
    .then(data => {
        if (line !== "all") {
            if (line === "green") {
                filteredLines = data.features.filter(feature => feature.properties.color === line || feature.properties.color === "limegreen");
            } else if (line === "blue") {
                filteredLines = data.features.filter(feature => feature.properties.color === line || feature.properties.color === "deepskyblue");
            } else {
                filteredLines = data.features.filter(feature => feature.properties.color === line);
            }
        } else {
            filteredLines = data
        }
        L.geoJSON(filteredLines, {
            style: function(feature) {
                return {
                    color: feature.properties.color || '#FF0000',
                    weight: 4,
                    opacity: 1.0
                };
            },
            pane: 'linesPane' // Set pane for lines
        }).addTo(linesLayer);
    })
    .catch(error => console.error('Error loading lines GeoJSON:', error));   
}
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