import React, { StrictMode, useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Individual imports for each component used in this sample
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-popup";
import "@arcgis/map-components/components/arcgis-zoom";
import "@arcgis/map-components/components/arcgis-legend";
import "@arcgis/map-components/components/arcgis-search";
import "@arcgis/charts-components/components/arcgis-chart";
import "@arcgis/charts-components/components/arcgis-charts-action-bar";
import Circle from "@arcgis/core/geometry/Circle.js";

// Core API import
import Graphic from "@arcgis/core/Graphic.js";

function App() {
  const [mode, setMode] = useState(null);
  const modeRef = useRef(mode);
  const popupRef = useRef(null);

  // Keep modeRef in sync with mode
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  
  // Close popup immediately when switching to buffer mode
  useEffect(() => {
    if (mode === "buffer" && popupRef.current.visible) {
      popupRef.current.visible = false
      
    }
  }, [mode]);
 
  
  const handleViewReady = (event) => {
    const viewElement = event.target;
    // const view = event.target.view

    const point = {
      type: "point",
      longitude: -118.38,
      latitude: 33.34,
    };
    // Circle geometry (e.g., radius of 5000 meters)

    // Circle symbol
    const circleSymbol = {
      type: "simple-fill",
      color: [0, 0, 255, 0.2], // semi-transparent blue
      outline: {
        color: [0, 0, 255, 1], // solid blue outline
        width: 2,
      },
    };

    const markerSymbol = {
      type: "simple-marker",
      style: "triangle",
      size: 15,
      color: "red",
      outline: {
        color: "white",
        width: 2,
      },
    };

    

    // Listen for clicks on the view and open the popup at the clicked location with custom content.
    viewElement.addEventListener("arcgisViewClick", async (event) => {
      const { mapPoint } = event.detail;
      viewElement.graphics.removeAll();

      const popupComponent = document.querySelector("arcgis-popup");
       popupRef.current = popupComponent;
        console.log(popupRef.current.visible);
        
      // Use modeRef.current instead of mode to get latest mode inside listener
      if (modeRef.current === "coordinates") {
        
        popupComponent.open({
          location: mapPoint,
          title: "Coordinates",
          content: `Latitude: ${mapPoint.latitude.toFixed(
            5
          )}, Longitude: ${mapPoint.longitude.toFixed(5)}`,
        });
        ;
        
      } else if (modeRef.current === "buffer") {
        
        const featureLayer = viewElement.map.layers.find(
          (layer) => layer.type === "feature" // or add additional checks if you have multiple
        );

        const circleGeometry = new Circle({
          center: mapPoint,
          radius: 50000,
          radiusUnit: "meters",
        });

        const circleGraphic = new Graphic({
          geometry: circleGeometry,
          symbol: circleSymbol,
        });

        viewElement.graphics.add(circleGraphic);

        const query = featureLayer.createQuery();
        query.geometry = circleGeometry;
        query.spatialRelationship = "intersects";
        query.returnGeometry = true;
        // query.outFields = ["id"];

        try {
          const result = await featureLayer.queryFeatures(query);
          // Add queried features to the map graphics
          result.features.forEach((feature) => {
            viewElement.graphics.add(feature);
          });
        } catch (err) {
          console.log(err);
        }
      }

      const pointGraphic = new Graphic({
        geometry: mapPoint,
        symbol: markerSymbol,
      });
    });
  };

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 10,
          background: "white",
          padding: "5px",
          borderRadius: "4px",
        }}
      >
        <button
          onClick={() => setMode("coordinates")}
          disabled={mode === "coordinates"}
        >
          Get Coordinates
        </button>
        <button
          onClick={() => setMode("buffer")}
          disabled={mode === "buffer"}
          style={{ marginLeft: 10 }}
        >
          Buffer & Query Features
        </button>
      </div>
      <arcgis-map
        item-id="02b37471d5d84cacbebcccd785460e94"
        onarcgisViewReadyChange={handleViewReady}
      >
        <arcgis-popup id="popup"></arcgis-popup>
        {/* <arcgis-chart layer-item-id="a1dcdab248cc4618b6426fd5b16106c0" chart-index="0" slot="bottom-right"></arcgis-chart>
      <arcgis-zoom slot="top-left" />
      <arcgis-search slot="top-right" />
      <arcgis-legend slot="bottom-left" /> */}
      </arcgis-map>
    </div>
  );
}

// Mount the app
const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
