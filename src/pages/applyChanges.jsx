import React, { useState, useEffect } from "react";
import {invokeLambdaDirectly,checkServerResponse,updateStoreFromList} from "../utils/lambdaAccess.js";
import {fetchStores,fetchSuppliers} from "../utils/lambdaAccess.js";
import {OrderedDictionaryArrayTable} from "../utils/OrderedDictionaryArrayTable.js";
import {Status} from "../utils/status.js";
import FileUploader from "../components/FileUploader.js";

import {
    Button,
    SelectField,  
    CheckboxField,
    View,
    Flex,
    Text,
    Heading,
  } from "@aws-amplify/ui-react"; 


const ApplyChanges = () => {

    const [changes,setChanges] = useState([]);
    const [status,setStatus] = useState("");
    const [inputs, setInputs] = useState({});
    const [stores,setStores] = useState([]);
    const [suppliers,setSuppliers] = useState([]);
    const [selectedStores, setSelectedStores] = useState([]);

    const [storeUpdateStatus,setStoreUpdateStatus] = useState([])
    const [storeUpdateResults,setStoreUpdateResults] = useState([])


    useEffect(() => {
        //Runs only on the first render
        fetchStores(setStores);
        fetchSuppliers(setSuppliers,""); // fetch all suppliers, not filtered by store, as there is no store selection yet
      }, []);

 
    const setStatusMultipleStores = () => {
        var message = "";
        for (var i in storeUpdateStatus) {
            message = message+ storeUpdateStatus[i] + ", ";
        }
        setStatus(message);
    }

    const setResultsMultipleStoreUpdates = () => {
        var resultList=[];
        for (var i in storeUpdateResults) {
            resultList = resultList.concat(storeUpdateResults[i]);
        }
        setChanges(resultList);
    }

    async function applyOneStore(storename,supplier) {
        
        try {
            const queryStringParameters={
                supplier: supplier
            }
            storeUpdateStatus[storename]="Waiting for store "+ storename;
     
            const response = await invokeLambdaDirectly('PUT','/changes/{storename+}','/changes/'+storename,{'storename':storename},queryStringParameters,"");
            console.log(response);

            const message=checkServerResponse(response);
            if (message !== "") {
                console.log("Error: ",message);
                storeUpdateStatus[storename]="Failed applying to store "+ storename + ": " + message;
                storeUpdateResults[storename]="";
            }
            else {
                const payload= JSON.parse(response.Payload);
                const body=JSON.parse(payload.body);
                console.log("body:",body);
                if (body.length ===0) {
                    storeUpdateStatus[storename]="No differences found for store "+ storename ;
                } else {
                    storeUpdateStatus[storename]="Completed applying to store "+ storename;
                }

                // prepare to display - add to each line also a 'store' attribute
                const storeResults = body.map( (line) => (  
                    {...line, Store:storename}
                ));

                storeUpdateResults[storename]=storeResults;
            }
            return(response);
        } catch (error) {
            console.error(error);
            const response=error;
            storeUpdateStatus[storename]="Problems while applying to store "+ storename + ": " + error;
            storeUpdateResults[storename]=[];
            return(response);
        }
    }

    const applyToStores = () => {
        console.log("in applytoStores");
        //setInputs(values => ({...values,  applyToStore: true }));
        console.log("inputs:",inputs);

        console.log("selected stores: ",selectedStores);

        if (selectedStores.length !== 0) {
            var message = "Applying changes to stores: ";
            for (var i in selectedStores) {
                message = message+ selectedStores[i] + ", ";
            }
            message = message + "..."
    
            setStatus(message);

            setStoreUpdateStatus([]);
            setStoreUpdateResults([]);
            setChanges([]);
            for (i in selectedStores) {
                var storename=selectedStores[i];

                applyOneStore(storename,inputs.supplier).then(res => {
                    console.log(res);
    
                    const message=checkServerResponse(res);
                    if (message !== "") {
                        console.log("Error: ",message);
                        setStatusMultipleStores();
                        setResultsMultipleStoreUpdates();
                    }
                    else {
                        setStatusMultipleStores();
                        setResultsMultipleStoreUpdates();
                        //type="results";

                    }
                }
                );
            }
        } else {
            setStatus("No stores selected");
            setChanges([]);
        }
  
    }

    async function applyValuesOneStore(storename,values) {
        
        try {

            storeUpdateStatus[storename]="Waiting for store "+ storename;
   
            const response = await updateStoreFromList(storename,values);
            console.log(response);

            const message=checkServerResponse(response);
            if (message !== "") {
                console.log("Error: ",message);
                storeUpdateStatus[storename]="Failed applying to store "+ storename + ": " + message;
                storeUpdateResults[storename]="";
            }
            else {
                const payload= JSON.parse(response.Payload);
                const body=JSON.parse(payload.body);
                console.log("body:",body);
                if (body.length ===0) {
                    storeUpdateStatus[storename]="No differences found for store "+ storename ;
                } else {
                    storeUpdateStatus[storename]="Completed applying to store "+ storename;
                }

                // prepare to display - add to each line also a 'store' attribute
                const storeResults = body.map( (line) => (  
                    {...line, Store:storename}
                ));

                storeUpdateResults[storename]=storeResults;
            }
            return(response);
        } catch (error) {
            console.error(error);
            const response=error;
            storeUpdateStatus[storename]="Problems while applying to store "+ storename + ": " + error;
            storeUpdateResults[storename]=[];
            return(response);
        }
    }

    const applyValuesToStores = (values) => {
        console.log("in applyValuesToStores");
        //setInputs(values => ({...values,  applyToStore: true }));
        console.log("inputs:",inputs);

        console.log("selected stores: ",selectedStores);

        if (selectedStores.length !== 0) {
            var message = "Applying changes to stores: ";
            for (var i in selectedStores) {
                message = message+ selectedStores[i] + ", ";
            }
            message = message + "..."
    
            setStatus(message);

            setStoreUpdateStatus([]);
            setStoreUpdateResults([]);
            setChanges([]);
            for (i in selectedStores) {
                //var storename=selectedStores[i];
                applyValuesOneStore(selectedStores[i],values).then(res => {
                    console.log(res);
                    const message=checkServerResponse(res);
                    if (message !== "") {
                        console.log("Error: ",message);
                        setStatusMultipleStores();
                        setResultsMultipleStoreUpdates();
                    }
                    else {
                        setStatusMultipleStores();
                        setResultsMultipleStoreUpdates();
                    }
                });
            }
        } else {
            setStatus("No stores selected");
            setChanges([]);
        }
  
    }

    function InputForm() {

        const CheckboxSelectStores = () => {
            console.log("in CheckboxSelectStores:" );
            

            const handleStoreSelectionChange = (e) => {
                const name = e.target.name;
                //const value = e.target.value;
                //console.log("store selection change: ",name,value);
                //checkStores[name] = !checkStores[name];
                //setAllChecked(false);
                //console.log("changed to:",checkStores);

                if (selectedStores.includes(name)) {
                    setSelectedStores(selectedStores.filter(id => id !== name));
                } else {
                    setSelectedStores([...selectedStores, name]);
                }
                  
            };

            useEffect(() => {
                //console.log("in useEffect of CheckboxSelectStores ",checkStores);

              }, []);
          
 
            return (
              <Flex direction="row" gap="0" paddingTop="5px">
                <Text paddingTop="20px">Select stores</Text>
                <View paddingLeft="20px" paddingTop="10px" paddingRight="30px">
                    {stores && stores.map((store) => (
                        <CheckboxField key={store.StoreName} value={store.StoreName} name={store.StoreName} label={store.StoreName} checked={selectedStores.includes(store.StoreName)} onChange={handleStoreSelectionChange}/>
                    ))} 
                </View>
              </Flex>
            );
          };

        const handleSupplierChange = (event) => {
            const name = event.target.name;
            const value = event.target.value;
            setInputs(values => ({...values, [name]: value}))
            setStatus("");
            setChanges([]);
        }

        const [showImportForm,setShowImportForm] = useState(false);
        const [importButtonText,setImportButtonText] = useState("Import changes from CSV/Excel");
        function showImportButton() {
            console.log("in showImportButton");
          if (showImportForm) {
            setShowImportForm(false);
            setImportButtonText("Import changes from CSV/Excel");
          } else {
            console.log("showing import form");
            setShowImportForm(true);
            setImportButtonText("Hide import form");
          }
        }
 
        return ( 
            <Flex   alignItems="left"    alignContent="flex-start"  direction="column">
                <Flex   alignItems="center"    alignContent="flex-start" >
                    <SelectField  key="supplier" name="supplier" placeholder="All suppliers" value={inputs.supplier || ""}  onChange={handleSupplierChange}>
                            {suppliers && suppliers.map((supplier) => (
                                <option key={supplier} value={supplier}>
                                    {supplier}
                                </option>
                            ))}
                    </SelectField>
                    <CheckboxSelectStores></CheckboxSelectStores>
                    <Button key="applydiffs" name="apply_changes" onClick={applyToStores} >
                        Apply differences from DB
                    </Button>
                    <Button key="showImportButton" name="show_import_button" onClick={showImportButton}>{importButtonText}</Button>
                </Flex>
                 {showImportForm && <FileUploader applyToStores={applyValuesToStores}/>}
            </Flex>
        )
    }

    function DisplayContent() {

        if (changes.length !== 0) {
            const columns=['SKU', 'Name', 'Supplier', 'Result', 'Store', 'Details'];
            return (
                <>
                    <Heading level={4}>Results</Heading>
                    <OrderedDictionaryArrayTable items={changes} columns={columns}/>
                </>
            )
        } else {
             return (
                ""
            )
        }
    }

    console.log("changes:",changes);
    return (
        <div style={{ marginTop: '30px' }}>
            <h2>Select stores to apply changes</h2>
            <InputForm/>
            <h4><Status status={status} /> </h4>
            <DisplayContent  />
        </div>
    );
};

export default ApplyChanges;
