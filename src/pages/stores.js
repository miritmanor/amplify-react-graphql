import React, { useState, useEffect } from "react";
import "../App.css";
import "@aws-amplify/ui-react/styles.css";
import {fetchStores} from "../utils/lambdaAccess.js";
import {OrderedDictionaryArrayTable} from "../components/OrderedDictionaryArrayTable.js";

import {
  View,
} from "@aws-amplify/ui-react";


const Stores = () => {
  const [stores,setStores] = useState([]);
  const [formattedStores,setFormattedStores]= useState([]);


  // only on first render - fetch stores. when done it will set the stores array
  useEffect(() => {
    console.log("in useEffect - fetching");
    fetchStores(setStores,""); 
  }, []);

  useEffect(() => {
    console.log("in useEffect - stores ready");
    // convert dates
    
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    };
    const formatted=[];
    for (var i in stores) {
        formatted[i] = stores[i];
        console.log(stores[i]);
        var localTime = new Date(stores[i]["LastSync"]);
        var formattedTimestamp = localTime.toLocaleString('en-US', options);
        //console.log(formattedTimestamp);
        formatted[i]["LastSync"]=formattedTimestamp;
        localTime = new Date(stores[i]["LastUpdated"]);
        formattedTimestamp = localTime.toLocaleString('en-US', options);
        //console.log(formattedTimestamp);
        formatted[i]["LastUpdated"]=formattedTimestamp;
    }
    setFormattedStores(formatted);

  }, [stores]);

  const columns=["StoreName","LastSync","LastUpdated","URL","APIKey","WP_application_password_name"];

  return (
    <View style={{ marginTop: '50px' }}>
      <h2>Commiz stores - database list </h2>
      <OrderedDictionaryArrayTable items={formattedStores} columns={columns}/>

    </View>
  );
};



export default Stores;
