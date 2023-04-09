import React, { useState, useEffect } from "react";
import "../App.css";
import "@aws-amplify/ui-react/styles.css";
import {invokeLambdaDirectly} from "../lambdaAccess.js";
import {fetchStores} from "../lambdaAccess.js";

import {
  Heading,
  Text,
} from "@aws-amplify/ui-react";


const Changes = () => {

    const [changes,setChanges] = useState([]);
    const [status,setStatus] = useState("");
    //var changeList="";
    const [inputs, setInputs] = useState({});
    const [stores,setStores] = useState([])

    useEffect(() => {
        //Runs only on the first render
        fetchStores(setStores);
      }, []);

      const showStoreDifferences = () => {
        console.log("in showStoreDifferences");
        //setInputs(values => ({...values,  showStoreDifferences: true }));
        console.log("inputs:",inputs);
        setStatus("Working... waiting for results");
        if (!Object.hasOwn(inputs, 'storename') || !inputs.storename) {
            console.log("missing store name");
            setStatus("Store name missing");
            setChanges([]);
        } else {
            const storename=inputs.storename;
            const queryStringParameters={
                supplier: inputs.supplier
            }
            console.log(queryStringParameters);
            invokeLambdaDirectly('GET','/changes/{storename+}','/changes/'+storename,{'storename':storename},queryStringParameters,"").then(res => {
                    console.log(res);
                    const payload= JSON.parse(res.Payload);
                    const body=JSON.parse(payload.body);
                    setStatus("ready");
                    setChanges(body);
                    }
                );
        }
    }

    const applyToStore = () => {
        console.log("in applytoStore");
        //setInputs(values => ({...values,  applyToStore: true }));
        console.log("inputs:",inputs);
        setStatus("Working... waiting for results");
        if (!Object.hasOwn(inputs, 'storename') || !inputs.storename) {
            console.log("missing store name");
            setStatus("Store name missing");
            setChanges([]);
        } else {
            const storename=inputs.storename;
            invokeLambdaDirectly('PUT','/changes/{storename+}','/changes/'+storename,{'storename':storename},"","").then(res => {
                console.log(res);
                const payload= JSON.parse(res.Payload);
                const body=JSON.parse(payload.body);
                setStatus("ready");
                setChanges(body);
                }
            )
        }

    }


    function InputForm() {

        const handleChange = (event) => {
            const name = event.target.name;
            const value = event.target.value;
            setInputs(values => ({...values, [name]: value}))
        }
 
        const handleSubmit = (event) => {
            console.log("in handleSubmit");
            event.preventDefault();
            console.log("inputs:",inputs);
            setStatus("Waiting for results");
            if (!Object.hasOwn(inputs, 'storename') || !inputs.storename) {
                console.log("missing store name");
                setStatus("Store name missing");
                setChanges([]);
            } else {
                const storename=inputs.storename;
                if (inputs.showStoreDifferences) {
                    invokeLambdaDirectly('GET','/changes/{storename+}','/changes/'+storename,{'storename':storename},"","").then(res => {
                            console.log(res);
                            const payload= JSON.parse(res.Payload);
                            const body=JSON.parse(payload.body);
                            setStatus("ready");
                            setChanges(body);
                        }
                    );
                }
                if (inputs.applyToStore) {
                    invokeLambdaDirectly('PUT','/changes/{storename+}','/changes/'+storename,{'storename':storename},"","").then(res => {
                        console.log(res);
                        const payload= JSON.parse(res.Payload);
                        const body=JSON.parse(payload.body);
                        setStatus("ready");
                        setChanges(body);
                    }
                );
              }
            }

        }

        return (

            <form onSubmit={handleSubmit}>
                <label>Store name:
                    <select key="storename" name="storename" value={inputs.storename || ""}  onChange={handleChange}>
                        <option key="" value="">Select store</option>
                        {stores.map((store) => (
                            <option key={store.StoreName} value={store.StoreName}>
                                {store.StoreName}
                            </option>
                        ))}
                    </select>
                </label>
                <label> Supplier name (optional):
                <input 
                    type="text" 
                    name="supplier" 
                    key="supplier"
                    autoFocus
                    value={inputs.supplier || ""} 
                    onChange={handleChange}
                />
                </label>
                <button key="showdiffs" type="button" name="show_differences" onClick={showStoreDifferences} >
                    Show differences 
                </button>
                <button key="applydiffs"  type="button" name="apply_changes" onClick={applyToStore} >
                    Apply main database values to store
                </button>
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
   
        console.log(typeof changeList);
        var header=false; 
        if (changeList === [] || status !== "ready") {
            return (
                <>
                    <Heading level={4}>{status}</Heading>
                </>
            );            
        }
        console.log("changelist not [] ",changeList);
        changeList.forEach((change) => {
            if (!header) {
                var headercolumns=[];
                Object.keys(change).forEach((key, index) => {
                    headercolumns.push(
                        <th> {key} </th>
                    ) ;
                });
                rows.push(
                    <tr> {headercolumns} </tr>
                );
                header=true;
            }
            rows.push(
                <ChangesRow change={change} key={change.sku} />
            );
        });

        if (rows === []) {
            return(
                <>
                <Text> No differences found - store fully up-to-date</Text>
                </>
            )
        }
        else return (
            <>
                <Heading level={4}>Differences between store (current values) and main database (new values)</Heading>
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
