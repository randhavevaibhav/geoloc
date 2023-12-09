import L from "leaflet";
import { createControlComponent } from "@react-leaflet/core";
import "leaflet-routing-machine";



export const createRoutineMachineLayer = (twoPos) => {
   
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

export default RoutingMachine;

