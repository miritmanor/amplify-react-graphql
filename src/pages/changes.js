import React, { useState, useEffect } from "react";
//import "../App.css";
//import "@aws-amplify/ui-react/styles.css";
import {invokeLambdaDirectly,checkServerResponse} from "../lambdaAccess.js";
import {fetchStores} from "../lambdaAccess.js";
import {Table} from "../mapToTable.js";
import {Status} from "../status.js";
import {
    Button,
    SelectField,
    Flex,
    Heading,
    Text,
    TextField,
    View,
  } from "@aws-amplify/ui-react";


const Changes = () => {

    const [changes,setChanges] = useState([]);
    const [status,setStatus] = useState("");
    const [inputs, setInputs] = useState({});
    const [stores,setStores] = useState([])
    var type="none"; // type is none when no results available, when available - shows the type of results (differences or results)

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
                    const message=checkServerResponse(res);
                    if (message != "") {
                        console.log("Error: ",message);
                        setStatus(message);
                    }
                    else {
                        setStatus("ready");
                        type="differences";
                        setChanges(body);
                    }                   
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
                const message=checkServerResponse(res);
                if (message != "") {
                    console.log("Error: ",message);
                    setStatus(message);
                }
                else {
                    setStatus("ready");
                    type="results";
                    setChanges(body);
                }
            }
            );
   
        }

    }


    function InputForm() {

        const handleChange = (event) => {
            const name = event.target.name;
            const value = event.target.value;
            setInputs(values => ({...values, [name]: value}))
            setStatus("");
            setChanges([]);
        }
 
         return (

            <Flex   alignItems="center"    alignContent="flex-start" >
                <SelectField  key="storename" name="storename" placeholder="Select store" value={inputs.storename || ""}  onChange={handleChange}>
                        {stores.map((store) => (
                            <option value={store.StoreName}>
                                {store.StoreName}
                            </option>
                        ))}

                </SelectField>
                <label> Supplier name (optional):
                <input  type="text"  name="supplier"  key="supplier"  autoFocus  value={inputs.supplier || ""}   onChange={handleChange}  />
                </label>
                <Button key="showdiffs" name="show_differences" onClick={showStoreDifferences} >
                    Show differences 
                </Button>
                <Button key="applydiffs" name="apply_changes" onClick={applyToStore} >
                    Apply main database values to store
                </Button>
          
            </Flex>

        )
    }

    function DisplayContent() {

        if (changes.length != 0) {
            if (type === "differences") {
                return (
                    <>
                        <Heading level={4}>Differences between store (current values) and main database (new values)</Heading>
                        <Table rowList={changes} rowkey='sku' />
                    </>
                )
            } else {
                return (
                    <>
                        <Heading level={4}>Results</Heading>
                        <Table rowList={changes} rowkey='sku' />
                    </>
                )
            } 
        } else {
             return (
                ""
            )
        }
    }

    console.log("changes:",changes);
    return (
        <div style={{ marginTop: '50px' }}>
            <h2>Select store to display differences</h2>
            <InputForm/>
            <Status status={status} />
            <DisplayContent  />
        </div>
    );
};



export default Changes;
