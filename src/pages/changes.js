import React, { useState, useEffect } from "react";
import "../App.css";
import "@aws-amplify/ui-react/styles.css";
import {invokeLambdaDirectly} from "../lambdaAccess.js";

import {
  Button,
  Flex,
  Heading,
  Text,
  TextField,
  View,
  withAuthenticator,
} from "@aws-amplify/ui-react";


const Changes = () => {

    const [changes,setChanges] = useState([]);
    const [status,setStatus] = useState("");
    var changeList="";
    const [inputs, setInputs] = useState({});

    function InputForm() {

    
        const handleChange = (event) => {
            const name = event.target.name;
            const value = event.target.value;
            setInputs(values => ({...values, [name]: value}))
        }
    
        const handleSubmit = (event) => {
            event.preventDefault();
            console.log("inputs:",inputs);
            setStatus("Waiting for results");
            if (!Object.hasOwn(inputs, 'storename')) {
                console.log("missing store name");
                setStatus("Store name missing");
                setChanges([]);
            } else {
                const storename=inputs.storename;
                var results= invokeLambdaDirectly('GET','/changes/{storename+}','/changes/'+storename,{'storename':storename},"","").then(res => {
                        console.log(res);
                        const payload= JSON.parse(res.Payload);
                        const body=JSON.parse(payload.body);
                        setStatus("ready");
                        setChanges(body);
                    }
                );
            }

        }
    
        return (

            <form onSubmit={handleSubmit}>
                <label>Store name:
                <input 
                    type="text" 
                    name="storename" 
                    value={inputs.storename || ""} 
                    onChange={handleChange}
                />
                </label>
                <label> Supplier name (optional):
                <input 
                    type="text" 
                    name="supplier" 
                    value={inputs.supplier || ""} 
                    onChange={handleChange}
                />
                </label>
                <input type="submit" name="Compare" />
            </form>
        )
    }

    function ChangesRow({ change , key}) {
        var columns=[];

        Object.keys(change).forEach((key, index) => {
            //console.log(key,change[key])
            columns.push(
              <td> {change[key]} </td>
            ) ;
        });

        return (
        <>
          <tr>
          {columns}
          </tr>
          </>
        );
      }

    function ChangesTable({changeList}) {

        const rows = [];
   
        var header=0; 
        if (changeList == [] || status != "ready") {
            return (
                <>
                    <Heading level={4}>{status}</Heading>
                </>
            );            
        }
        console.log("changelist not [] ",changeList);
        changeList.forEach((change) => {
            if (header == 0) {
                var headercolumns=[];
                Object.keys(change).forEach((key, index) => {
                    headercolumns.push(
                        <th> {key} </th>
                    ) ;
                });
                rows.push(
                    <tr> {headercolumns} </tr>
                );
                header=1;
            }
            rows.push(
                <ChangesRow change={change} key={change.sku} />
            );
        });

        return (
            <>
                <Heading level={4}>Changes</Heading>
                <table>
                    <tbody>
                    {rows}
                    </tbody>
                </table>
            </>
        );
    }

    console.log("changes:",changes);
    return (
        <div style={{ marginTop: '50px' }}>
            <h2>Select store to display differences</h2>
            <InputForm/>
            <ChangesTable changeList={changes}  />
        </div>
    );
};



export default Changes;
