import { useContext,useState } from "react";
import axios from "axios";
import { twoPosContext } from "./Contexts/twoPosContext";
const ReadMe = ()=>{

    const {selectTwoPos} = useContext(twoPosContext);
    let route={};

    let resultString ="";
   
    const [minimumToll,setMinimumToll] = useState(0);
    const [tollFlag,settollFlag] = useState(false);


const calculateToll = ()=>{

    if(selectTwoPos.length==2)
    {
         route = 
        {
            from:
            {
                lat:selectTwoPos[0][0],
                lng:selectTwoPos[0][1]
            },
            to:
            {
                lat:selectTwoPos[1][0],
                lng:selectTwoPos[1][1]
            },
        }
        console.log("route in ReadMe ---> "+JSON.stringify(route));
    
        axios.post(`https://geoloc-back-end.vercel.app/route`,route)
        .then((response)=>{
            resultString = JSON.stringify(response.data.result);
           // console.log("resultString after relacing \ -------> "+resultString.indexOf("minimumTollCost"));
           resultString = resultString.substring(resultString.indexOf("minimumTollCost") + 18,resultString.indexOf("minimumTollCost") + 28);
        //    if(isNaN(resultString))
        //    {
        //     setMinimumToll(0);  
        //    }
        //    else{
        //     setMinimumToll(parseInt(resultString));
        //    }
           
        setMinimumToll(parseInt(resultString));
           console.log("minimumToll ---> "+minimumToll);
    
        })
        .catch((error)=>{
           
            alert(`An Error ocuured please check the console log`)
            console.log(error);
        })
    
    }
    settollFlag(true);

   

}

return(<>
<div id="ReadMe">
{selectTwoPos.length==2?
<div  id="Toll-Button" >
<button className="button-19" role="button" onClick={()=>{calculateToll()}}>Calculate Toll</button>
    </div>:""}


{tollFlag?<h2 id="toll-text">Minimum Toll is ₹ {minimumToll}</h2>:""}
<div id="instructions">

<h2>Instructions :</h2>
    <h3> 1. Click on the search icon to find starting location.</h3>
    <h3> 2. Then with rectangular selection find the nearest restaurant.</h3>
    <h3> 3. Then click on the marker of restaurant to find the path and distance between two points.</h3>
    <h3> 4. After that click on "Calculate Toll" button to get toll price</h3>
    

</div>
   



</div>





</>);

    
};


export default ReadMe;