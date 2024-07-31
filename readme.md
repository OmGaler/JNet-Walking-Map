# Jerusalem Light Rail Walking Time Isochrones Visualisation
This project visualises the walking time isochrones (areas accessible within a certain time) for each station (existing and planned) on the Jerusalem Light Rail network (J-Net) using [OSMnx](https://github.com/gboeing/osmnx), [Leaflet.js](https://github.com/Leaflet/Leaflet) and GeoJSON transport data from [geo.mot.gov.il](geo.mot.gov.il). Inspired by [metroTLV walkshed](https://github.com/elad661/metroTLV_walkshed).


## Usage

- View the web app [here](https://omgaler.github.io/JNet-Walking-Map/)

Alternatively, to run locally:
1. **Generate Isochrone GeoJSONs:**
    - Open and run the `jlem_lr_isochrones.ipynb` Jupyter Notebook.
2. **View the Map in the Web App:**
    ```bash
    python -m http.server 8000
    ```
    - Open `localhost:8000` in your web browser.

## Notes
Walking times can be viewed for all or individual lines, and can be limited to 5-20 minutes. Click on a station to see its name and what lines stop there. 
