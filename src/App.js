// https://codesandbox.io/s/spring-flower-x2dr5n
import React, { useState, useEffect,useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  Popup,
  Marker,
  FeatureGroup
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import { Icon} from "leaflet";
import "leaflet/dist/images/marker-icon-2x.png";
import "leaflet/dist/images/marker-shadow.png";
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

import LeafletControlGeocoder from "./LeafletControlGeocoder";

import { twoPosContext } from "./Contexts/twoPosContext";



import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
// import RoutingMachine from "./RoutingMachine";

import { createControlComponent } from "@react-leaflet/core";
import "leaflet-routing-machine";
import $ from 'jquery';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow
});

L.Marker.prototype.options.icon = DefaultIcon;

const baseMaps = {
  OpenStreetMap: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  Satellite:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
  // Add more base maps here...
};









const PolygonMap = () => {
  const [activePolygon, setActivePolygon] = useState(null);
  const [selectedBaseMap, setSelectedBaseMap] = useState("OpenStreetMap");
  const [drawnPolygon, setDrawnPolygon] = useState(null);
  const [posMarkers, setPosMarkers] = useState([]);
  const [selectTwoPos, setSelectTwoPos] = useState([]);
  const [renderRoute, setRenderRoute] = useState(false);
  const latlons = [];
  const positions =[];
  
  const [map, setMap] = useState(null);
 

 

  const handleBaseMapChange = (event) => {
    setSelectedBaseMap(event.target.value);
  };

  const addMarkers = (latlons) => {
    console.log(latlons)
    setPosMarkers(latlons);
  }

  const changeLocation = (pos)=>{


   if(selectTwoPos.length>=2)
   {

    console.log("calling change location ===> ");

    

    console.log("selectTwoPos after slice ===> "+selectTwoPos.slice(0,1));
    setSelectTwoPos(selectTwoPos.slice(0,1));
    setSelectTwoPos(selectTwoPos => [...selectTwoPos,pos] );
 


   }

   setRenderRoute(!renderRoute);
   let control;


   


  }


  // Routing Machine
  const createRoutineMachineLayer = (twoPos) => {
   
    let startLat=twoPos.NextPos[0][0];
    let startLong=twoPos.NextPos[0][1];
    let endtLat=twoPos.NextPos[1][0];
    let endtLong=twoPos.NextPos[1][1];
   
    console.log("startLat ===> "+startLat);
    console.log("startLong ===> "+startLong);
    console.log("endtLat ===> "+endtLat);
    console.log("endtLong ===> "+endtLong);



   

   
      const instance = L.Routing.control({
           waypoints: [
            L.latLng(startLat, startLong),
            L.latLng(endtLat,  endtLong)
         ],
          addWaypoints: true,
   
        });

        
     
      return instance;
};

const RoutingMachine = createControlComponent(createRoutineMachineLayer);



  // Routing Machine





  

  
 




  function makeOverpassQuery(qstrg) {
    // Split the input string into individual coordinates
    const coordinates = qstrg.split(" ");
    coordinates.pop();

    console.log(coordinates);

    // Ensure that we have a valid number of coordinates
    if (coordinates.length % 2 !== 0) {
      throw new Error("Invalid number of coordinates in qstrg");
    }

    // Construct the query dynamically based on the coordinates
    const coordinatePairs = [];
    let ply1 = '';
    for (let i = 0; i < coordinates.length; i += 2) {
      const lat = coordinates[i];
      console.log(lat);
      const lon = coordinates[i + 1];
      ply1 += lat;
      ply1 += " ";
      ply1 += lon;
      ply1 += " ";

    }

    // Join the coordinate pairs to create the polygon in the query
    // const polygon = coordinatePairs.join(" ");
    ply1 = ply1.trim();

    console.log(ply1);

    const overpassQuery = `
      [out:json];
      node["amenity"="restaurant"](poly:"` + ply1 + `");
      out;
    `;

    return overpassQuery;
  }


  const handleDrawCreated = (e) => {

    
    const { layer } = e;
    console.log("layer ---> "+layer.toGeoJSON().geometry.coordinates[0]);
    setDrawnPolygon(layer.toGeoJSON());
    const points = layer.toGeoJSON().geometry.coordinates[0];
    console.log("points ---> "+points);
    let qstrg = '';
    points.forEach(point => {
      // console.log("Point[0] ---> "+point[0]);
      // console.log("Point[1] ---> "+point[1]);
      console.log("points ---> "+point);
      const x = point[0];
      const y = point[1];
      qstrg += y;
      qstrg += " " + x + " ";





    });
    console.log("qstrg ----> "+qstrg);
    const qry = makeOverpassQuery(qstrg);
    console.log("qry ----> "+qry);
    const encodedQuery = encodeURIComponent(qry);
    console.log("encodedQuery ----> "+encodedQuery);
    const overpassApiUrl = `https://overpass-api.de/api/interpreter?data=${encodedQuery}`;

    axios.get(overpassApiUrl)
      .then(response => {
        // Handle the response data here
         console.log(response.data);
        const restaurants = response.data.elements.filter(node => node.tags && node.tags.name);
         console.log("restaurants  ====> "+restaurants);
        response.data.elements.forEach(restaurant => {
          
          const rname = restaurant.tags.name ? restaurant.tags.name : undefined;
          console.log("restaurant name -----> "+rname);
          console.log("latitude -----> "+restaurant.lat);
          console.log("logitude ------> "+restaurant.lon);

          latlons.push([[restaurant.lat, restaurant.lon], rname]);
          
          //   console.log(restaurant.tags.name);
          //   console.log(restaurant.tags.phone);
          //   console.log(restaurant.tags.cuisine);



          //   console.log("______");
        });
        addMarkers(latlons);
        console.log("combined latlons ====> "+latlons);
      })
      .catch(error => {
        console.log("error", error);
      });

  };




  return (
  
    <>  

    <twoPosContext.Provider value={{selectTwoPos, setSelectTwoPos}}>

    <MapContainer
    center={[18.6321, 73.8468]}
    zoom={13}
    style={{ height: "100vh", width: "100%" }}
    whenReady={map => setMap(map)}
  >
     <LeafletControlGeocoder/>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url={baseMaps[selectedBaseMap]}
    />
   
    {<div >
      {posMarkers.map((data, index) => (
<Marker position={data[0]}  key={index} eventHandlers={{click:(e)=>{
  console.log("length of selectTwoPos after a click ----> "+selectTwoPos.length);
  setSelectTwoPos(selectTwoPos => [...selectTwoPos,data[0]] );


  changeLocation(data[0]);
 
  



 
  
  
  
  
  }}}>
  {data[1] ? (
    <Popup>
      <span>{data[1]}</span>
      <hr></hr>
      <span>{data[0]}</span>
    </Popup>
  ) : null}
</Marker>
))}

    
    </div>}
    

    <FeatureGroup>
      <EditControl
        position="topright"
        onCreated={handleDrawCreated}
        draw={{
          rectangle: true,
          polyline: false,
          circle: false,
          circlemarker: false,
          marker: false
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
        borderRadius: 5
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
      {/* {drawnPolygon && (
        <p>Workers inside drawn polygon: {"tmp"}</p>
      )} */}
    </div>
    
    

    {selectTwoPos.length===2?<RoutingMachine NextPos={selectTwoPos}/>:""} 
   
    

    

   
  </MapContainer>
  {console.log(selectTwoPos)}
    </twoPosContext.Provider>
    
    
    
    
   
 
  </>
 
    
  );
};

export default PolygonMap;
