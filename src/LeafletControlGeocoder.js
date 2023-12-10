// import "leaflet-control-geocoder/dist/Control.Geocoder.css";
// import "leaflet-control-geocoder/dist/Control.Geocoder.js";
// import { useMap } from 'react-leaflet/hooks';
// import { useEffect, useState } from "react";
// import icon from './assets/red-marker-icon.png';
// import iconShadow from 'leaflet/dist/images/marker-shadow.png';
// import { twoPosContext } from "./Contexts/twoPosContext";
// import { useContext } from "react";



// function LeafletControlGeocoder() {
//     const startPos=[];
//     const[isThisFuncCalled, setisThisFuncCalled] = useState(true);
//     const {selectTwoPos, setSelectTwoPos} = useContext(twoPosContext);
//     const map = useMap();
   
//     var geocoder = L.Control.Geocoder.nominatim();
//     if (typeof URLSearchParams !== "undefined" && location.search) {
//       // parse /?geocoder=nominatim from URL
//       var params = new URLSearchParams(location.search);
//       var geocoderString = params.get("geocoder");
//       if (geocoderString && L.Control.Geocoder[geocoderString]) {
//         geocoder = L.Control.Geocoder[geocoderString]();
//       } else if (geocoderString) {
//         console.warn("Unsupported geocoder", geocoderString);
//       }
//     }

//     var thisIcon = new L.Icon({
//       iconUrl: icon,
//       iconSize:[40,40]
    
    
//   })
//   if(isThisFuncCalled)
//   {

//     L.Control.geocoder({
//       defaultMarkGeocode: false
//       })
//         .on("markgeocode", function (e) {
        
//           var latlng = e.geocode.center;
//           startPos.push(latlng.lat);
//           startPos.push(latlng.lng);
         
//           if(selectTwoPos.length<2)
//           {
//             setSelectTwoPos(selectTwoPos => [...selectTwoPos,startPos] );
//           }
          
         
//           L.marker(latlng, { icon:thisIcon })
//             .addTo(map)
//             .bindPopup(e.geocode.name+" =====> "+latlng)
//             .openPopup();
//           map.fitBounds(e.geocode.bbox);
//         })
//         .addTo(map); 
//         setisThisFuncCalled(false);
//   }

   
  
 
  
//     return null;
//   }


//   export default LeafletControlGeocoder;

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.js";
import L from "leaflet";

import icon from './assets/red-marker-icon.png';

export default function LeafletControlGeocoder() {
  const map = useMap();

      var thisIcon = new L.Icon({
      iconUrl: icon,
      iconSize:[40,40]
    
    
  })

  useEffect(() => {
    var geocoder = L.Control.Geocoder.nominatim();
    if (typeof URLSearchParams !== "undefined" && location.search) {
      // parse /?geocoder=nominatim from URL
      var params = new URLSearchParams(location.search);
      var geocoderString = params.get("geocoder");
      if (geocoderString && L.Control.Geocoder[geocoderString]) {
        geocoder = L.Control.Geocoder[geocoderString]();
      } else if (geocoderString) {
        console.warn("Unsupported geocoder", geocoderString);
      }
    }

    L.Control.geocoder({
      query: "",
      placeholder: "Search here...",
      defaultMarkGeocode: false,
      geocoder
    })
      .on("markgeocode", function (e) {
        var latlng = e.geocode.center;
        L.marker(latlng, { icon:thisIcon })
          .addTo(map)
          .bindPopup(e.geocode.name)
          .openPopup();
        map.fitBounds(e.geocode.bbox);
      })
      .addTo(map);
  }, []);

  return null;
}
