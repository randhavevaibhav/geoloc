import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Popup,
  Marker,
  FeatureGroup,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import "leaflet/dist/images/marker-icon-2x.png";
import "leaflet/dist/images/marker-shadow.png";
import axios from "axios";
import "leaflet/dist/leaflet.css";

import LeafletControlGeocoder from "./LeafletControlGeocoder";

import { twoPosContext } from "./Contexts/twoPosContext";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

import { createControlComponent } from "@react-leaflet/core";
import "leaflet-routing-machine";
import ReadMe from "./ReadMe";
import "./styles.css";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

let ScreenWidth = screen.width;
let mapWidth = 70;
console.log("screenWidth --> "+ScreenWidth);
if(ScreenWidth<=600)
{
  mapWidth = 100;
}


L.Marker.prototype.options.icon = DefaultIcon;

const baseMaps = {
  OpenStreetMap: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  Satellite:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};

const TolMap = () => {
  const [selectedBaseMap, setSelectedBaseMap] = useState("OpenStreetMap");
  const [drawnPolygon, setDrawnPolygon] = useState(null);
  const [posMarkers, setPosMarkers] = useState([]);
  const [selectTwoPos, setSelectTwoPos] = useState([]);
  const [renderRoute, setRenderRoute] = useState(false);
  const latlons = [];

  const [map, setMap] = useState(null);

  const handleBaseMapChange = (event) => {
    setSelectedBaseMap(event.target.value);
  };

  const addMarkers = (latlons) => {
    console.log(latlons);
    setPosMarkers(latlons);
  };

  const changeLocation = (pos) => {
    if (selectTwoPos.length >= 2) {
      console.log("calling change location ===> ");

      console.log("selectTwoPos after slice ===> " + selectTwoPos.slice(0, 1));
      setSelectTwoPos(selectTwoPos.slice(0, 1));
      setSelectTwoPos((selectTwoPos) => [...selectTwoPos, pos]);
    }

    setRenderRoute(!renderRoute);
  };

  const createRoutineMachineLayer = (twoPos) => {
    let startLat = twoPos.NextPos[0][0];
    let startLong = twoPos.NextPos[0][1];
    let endtLat = twoPos.NextPos[1][0];
    let endtLong = twoPos.NextPos[1][1];

    const instance = L.Routing.control({
      waypoints: [L.latLng(startLat, startLong), L.latLng(endtLat, endtLong)],
      addWaypoints: true,
    });

    return instance;
  };

  const RoutingMachine = createControlComponent(createRoutineMachineLayer);

  function makeOverpassQuery(qstrg) {
    const coordinates = qstrg.split(" ");
    coordinates.pop();

    console.log(coordinates);

    if (coordinates.length % 2 !== 0) {
      throw new Error("Invalid number of coordinates in qstrg");
    }

    let ply1 = "";
    for (let i = 0; i < coordinates.length; i += 2) {
      const lat = coordinates[i];
      console.log(lat);
      const lon = coordinates[i + 1];
      ply1 += lat;
      ply1 += " ";
      ply1 += lon;
      ply1 += " ";
    }

    ply1 = ply1.trim();

    console.log(ply1);

    const overpassQuery =
      `
      [out:json];
      node["amenity"="restaurant"](poly:"` +
      ply1 +
      `");
      out;
    `;

    return overpassQuery;
  }

  const handleDrawCreated = (e) => {
    const { layer } = e;

    setDrawnPolygon(layer.toGeoJSON());
    const points = layer.toGeoJSON().geometry.coordinates[0];

    let qstrg = "";
    points.forEach((point) => {
      const x = point[0];
      const y = point[1];
      qstrg += y;
      qstrg += " " + x + " ";
    });

    const qry = makeOverpassQuery(qstrg);

    const encodedQuery = encodeURIComponent(qry);

    const overpassApiUrl = `https://overpass-api.de/api/interpreter?data=${encodedQuery}`;

    axios
      .get(overpassApiUrl)
      .then((response) => {
       
        response.data.elements.forEach((restaurant) => {
          const rname = restaurant.tags.name ? restaurant.tags.name : undefined;

          latlons.push([[restaurant.lat, restaurant.lon], rname]);

       
        });
        addMarkers(latlons);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  return (
    
    <div id="map-container">
      <twoPosContext.Provider value={{ selectTwoPos, setSelectTwoPos }}>
        <MapContainer
          center={[18.6321, 73.8468]}
          zoom={13}
           style={{ height: "80vh", width:mapWidth+"%" }}
          whenReady={(map) => setMap(map)}
        >
          <LeafletControlGeocoder />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={baseMaps[selectedBaseMap]}
          />

          {
            <div>
              {posMarkers.map((data, index) => (
                <Marker
                  position={data[0]}
                  key={index}
                  eventHandlers={{
                    click: () => {
                      console.log(
                        "length of selectTwoPos after a click ----> " +
                          selectTwoPos.length
                      );
                      setSelectTwoPos((selectTwoPos) => [
                        ...selectTwoPos,
                        data[0],
                      ]);

                      changeLocation(data[0]);
                    },
                  }}
                >
                  {data[1] ? (
                    <Popup>
                      <span>{data[1]}</span>
                      <hr></hr>
                      <span>{data[0]}</span>
                    </Popup>
                  ) : null}
                </Marker>
              ))}
            </div>
          }

          <FeatureGroup>
            <EditControl
              position="topright"
              onCreated={handleDrawCreated}
              draw={{
                rectangle: true,
                polyline: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polygon:false
              }}
            />
          </FeatureGroup>

          {/* Base Map Selector */}
          <div
            style={{
              marginTop: "200px",
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 1000,
              backgroundColor: "white",
              padding: 10,
              borderRadius: 5,
            }}
          >
            <label htmlFor="baseMapSelect">Base Map:</label>
            <select
              id="baseMapSelect"
              value={selectedBaseMap}
              onChange={handleBaseMapChange}
            >
              {Object.keys(baseMaps).map((mapName) => (
                <option key={mapName} value={mapName}>
                  {mapName}
                </option>
              ))}
            </select>
          </div>

          {selectTwoPos.length === 2 ? (
           <RoutingMachine NextPos={selectTwoPos} />
           
            
          ) : (
            ""
          )}
        </MapContainer>
        <ReadMe/>
      </twoPosContext.Provider>
      
  </div>
  );
};

export default TolMap;
