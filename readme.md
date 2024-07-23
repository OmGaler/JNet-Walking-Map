# Jerusalem Light Rail Walking Time Isochrones Visualisation
This project visualises the isochrones (areas accessible within a certain time) of walking times for each station on the  Jerusalem Light Rail network using OSMnx, Leaflet.js and GeoJSON transport data from [geo.mot.gov.il](geo.mot.gov.il).

## Usage

1. **Generate Isochrone GeoJSONs:**
    Open and run the `jlem_lr_isochrones.ipynb` Jupyter Notebook.
    

2. **View the Map in the Web App:**
    ```bash
    python -m http.server 8000
    ```
    - Open `localhost:8000` in your web browser.