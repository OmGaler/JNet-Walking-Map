const map = L.map('map', {
    // Initialize the map with default options
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

// Load and add isochrones GeoJSON
fetch('jlem_lrt_dist_iso_reprojected.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            style: function(feature) {
                return {
                    color: feature.properties.color || '#000000',
                    weight: 2,
                    opacity: 0.75
                };
            },
            pane: 'isochronesPane' // Set pane for isochrones
        }).addTo(map);

        // Add legend for isochrones
        addLegend(data.features);
    })
    .catch(error => console.error('Error loading isochrones GeoJSON:', error));

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
// const map = L.map('map', {
//     center: [31.771959, 35.217018],
//     zoom: 13
// });

// // Add OpenStreetMap tile layer
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// }).addTo(map);

// // Create custom panes
// map.createPane('isochronesPane');
// map.createPane('linesPane');
// map.createPane('stationsPane');

// map.getPane('isochronesPane').style.zIndex = 400;
// map.getPane('linesPane').style.zIndex = 500;
// map.getPane('stationsPane').style.zIndex = 600;

// // Layer groups
// const isochronesLayers = {};
// const activeIsochrones = [];
// const mergedIsochronesLayer = L.layerGroup().addTo(map);
// const linesLayer = L.layerGroup().addTo(map); 
// const stationsLayer = L.layerGroup().addTo(map); 

// // Add legend function
// function addLegend(features) {
//     const legend = document.getElementById('legend-items');
//     legend.innerHTML = '<h4>Walking Times</h4>';
    
//     const colourTime = new Map();
//     features.reverse().forEach(feature => {
//         const colour = feature.properties.color;
//         const time = feature.properties.time;
//         if (colour && time !== undefined) {
//             colourTime.set(colour, time);
//         }
//     });

//     colourTime.forEach((time, color) => {
//         const div = document.createElement('div');
//         div.innerHTML = '<span class="color-box" style="background-color: ' + color + ';"></span>' + time + ' minutes';
//         legend.appendChild(div);
//     });
// }

// // Function to load and add GeoJSON for isochrones
// function loadIsochrones(url, layerGroup) {
//     fetch(url)
//         .then(response => response.json())
//         .then(data => {
//             const layer = L.geoJSON(data, {
//                 style: function(feature) {
//                     return {
//                         color: feature.properties.color || '#000000',
//                         weight: 2,
//                         opacity: 0.75
//                     };
//                 },
//                 pane: 'isochronesPane'
//             });
//             layerGroup.addLayer(layer);
//             layer.on('add', () => {
//                 activeIsochrones.push(data);
//                 mergeIsochrones();
//             });
//             layer.on('remove', () => {
//                 const index = activeIsochrones.indexOf(data);
//                 if (index > -1) {
//                     activeIsochrones.splice(index, 1);
//                 }
//                 mergeIsochrones();
//             });
//             addLegend(data.features);
//         })
//         .catch(error => console.error('Error loading isochrones GeoJSON:', error));
// }

// // Function to merge active isochrones
// function mergeIsochrones() {
//     mergedIsochronesLayer.clearLayers();
//     if (activeIsochrones.length > 0) {
//         const merged = turf.union(...activeIsochrones.map(fc => turf.featureCollection(fc.features)));
//         L.geoJSON(merged, {
//             style: function(feature) {
//                 return {
//                     color: feature.properties.color || '#000000',
//                     weight: 2,
//                     opacity: 0.75
//                 };
//             },
//             pane: 'isochronesPane'
//         }).addTo(mergedIsochronesLayer);
//     }
// }

// // Load isochrones for each line
// const isochronesFiles = [
//     'isochrones_line1.geojson',
//     'isochrones_line2.geojson',
//     // Add paths for all isochrones files
// ];

// isochronesFiles.forEach((file, index) => {
//     const layerGroup = L.layerGroup();
//     isochronesLayers['Line ' + (index + 1)] = layerGroup;
//     loadIsochrones(file, layerGroup);
// });

// // Load and add lines GeoJSON
// fetch('data/jlem_lrt_lines_clr.geojson')
//     .then(response => response.json())
//     .then(data => {
//         L.geoJSON(data, {
//             style: function(feature) {
//                 return {
//                     color: feature.properties.color || '#FF0000',
//                     weight: 4,
//                     opacity: 1.0
//                 };
//             },
//             pane: 'linesPane'
//         }).addTo(linesLayer);
//     })
//     .catch(error => console.error('Error loading lines GeoJSON:', error));

// // Load and add stations GeoJSON
// fetch('data/jlem_lrt_stations.geojson')
//     .then(response => response.json())
//     .then(data => {
//         L.geoJSON(data, {
//             pointToLayer: function(feature, latlng) {
//                 return L.circleMarker(latlng, {
//                     radius: 6,
//                     fillColor: '#000000',
//                     color: '#FFFFFF',
//                     weight: 1,
//                     opacity: 1.0,
//                     fillOpacity: 1.0
//                 });
//             },
//             onEachFeature: function(feature, layer) {
//                 if (feature.properties && feature.properties.Name) {
//                     layer.bindTooltip('<b>' + feature.properties.Name + '</b>', { permanent: false, direction: 'top' });
//                     layer.bindPopup('<b>' + feature.properties.Name + '</b>');
//                 }
//             },
//             pane: 'stationsPane'
//         }).addTo(stationsLayer);
//     })
//     .catch(error => console.error('Error loading stations GeoJSON:', error));

// // Add layer control
// const overlayMaps = {
//     'Lines': linesLayer,
//     'Stations': stationsLayer,
//     ...isochronesLayers
// };

// L.control.layers(null, overlayMaps, {collapsed: false}).addTo(map);
