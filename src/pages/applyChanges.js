import React, { useState, useEffect } from "react";
import {invokeLambdaDirectly,checkServerResponse} from "../lambdaAccess.js";
import {fetchStores,fetchSuppliers} from "../lambdaAccess.js";
import {Table} from "../mapToTable.js";
import {Status} from "../status.js";
//import Multiselect from "@cloudscape-design/components/multiselect";
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


    //const [checkedItems, setCheckedItems] = React.useState([false, false]);
    //const checkedItemsRef = React.useRef(null);
    //const [allChecked, setAllChecked] = React.useState(false);
    const [checkStores,setCheckStores] = useState([]);

    const [storeUpdateStatus,setStoreUpdateStatus] = useState([])
    const [storeUpdateResults,setStoreUpdateResults] = useState([])

    //var type="none"; // type is none when no results available, when available - shows the type of results (differences or results)
    //var checkStores={};



    useEffect(() => {
        //Runs only on the first render
        fetchStores(setStores);
        fetchSuppliers(setSuppliers,""); // fetch all suppliers, not filtered by store, as there is no store selection yet
      }, []);

    useEffect(() => {

       var checked=[];
        for (var s in stores) {
            checked[stores[s].StoreName] = false;
        }
        setCheckStores(checked);

        console.log("initialized checkStores:",checkStores);
// eslint-disable-next-line
    }, [stores]);


    async function applyOneStore(storename,supplier) {
        
        try {
            console.log("invoking lambda now");
            //storeUpdateStatus.push({storename:[]})
            const queryStringParameters={
                supplier: supplier
            }
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
                console.log(body);
                storeUpdateStatus[storename]="Completed applying to store "+ storename;
                storeUpdateResults[storename]=body;
            }
            return(response);
        } catch (error) {
            console.error(error);
            const response=error;
            storeUpdateStatus[storename]="Failed applying to store "+ storename + ": " + error;
            storeUpdateResults[storename]=[];
            return(response);
        }
    }

    const displayMultipleStatus = () => {
        var message = "";
        for (var i in storeUpdateStatus) {
            message = message+ storeUpdateStatus[i] + ", ";
        }
    
        setStatus(message);
    }

     const displayMultipleResults = () => {

        var changelist=[];
        console.log(changelist);
        for (var i in storeUpdateResults) {
            console.log("i:",i," results:",storeUpdateResults[i]);
            changelist = changelist.concat(storeUpdateResults[i]);
        }
        console.log(changelist);
        setChanges(changelist);
        
    }

    const applyToStores = () => {
        console.log("in applytoStores");
        //setInputs(values => ({...values,  applyToStore: true }));
        console.log("inputs:",inputs);

        var storesToUpdate=[];
        for (var selected in checkStores) {
            if (checkStores[selected] === true) {
                storesToUpdate.push(selected);
            }
        }
        console.log(storesToUpdate);


        if (storesToUpdate.length !== 0) {
            var message = "Applying changes to stores: ";
            for (var i in storesToUpdate) {
                message = message+ storesToUpdate[i] + ", ";
            }
            message = message + "..."
    
            setStatus(message);

            setStoreUpdateStatus([]);
            setStoreUpdateResults([]);
            for (i in storesToUpdate) {
                var storename=storesToUpdate[i];

                applyOneStore(storename,inputs.supplier).then(res => {
                    console.log(res);
    
                    const message=checkServerResponse(res);
                    if (message !== "") {
                        console.log("Error: ",message);
                        displayMultipleStatus();
                        displayMultipleResults();
                    }
                    else {
                        displayMultipleStatus();
                        displayMultipleResults();
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

 

    function InputForm() {



        const CheckboxSelectStores = () => {

            //const allChecked = checkedItems.every(Boolean);
            //const isIndeterminate = checkedItems.some(Boolean) && !allChecked;

         
            //if (isIndeterminate) {
                //console.log("isIndeterminate");
              //checkedItemsRef.current = [...checkedItems];
            //}
            /*
            const handleAllStoresSelection = () => { 

                const cc=[];
                if (allChecked) {
                    setAllChecked(false);
                    for (var c in checkStores) {
                        cc[c] = false;
                    }
                    setCheckStores(cc);
                } else {
                    setAllChecked(true);
                    for (c in checkStores) {
                        cc[c] = true;
                    }  
                    setCheckStores(cc);                  
                }

                console.log(checkStores);
                
              if (isIndeterminate) {
                //setCheckedItems([true, true]);
              } else if (allChecked) {
                //setCheckedItems([false, false]);
              } else if (checkedItemsRef.current) {
                //setCheckedItems(checkedItemsRef.current);
              } else {
                //setCheckedItems([true, true]);
              }
             
            };
          
         */

            const handleStoreSelecteionChange = (e) => {
                const name = e.target.name;
                const value = e.target.value;
                console.log(name,value);
                checkStores[name] = !checkStores[name];
                //setAllChecked(false);
                console.log(checkStores);
                /*
              const newCheckedItems = [checkedItems[0], e.target.checked];
              if (!newCheckedItems.some(Boolean) || newCheckedItems.every(Boolean)) {
                checkedItemsRef.current = null;
              }
              setCheckedItems(newCheckedItems);
              */
            };
          
            return (
              <Flex direction="row" gap="0" paddingTop="5px">
                {/*}
                <CheckboxField
                  name="all-stores"
                  label="All stores"
                  value="allStores"
                  checked={allChecked}
                  isIndeterminate={isIndeterminate}
                  onChange={handleAllStoresSelection}
                />
            */}
                <Text paddingTop="20px">Select stores</Text>
                <View paddingLeft="20px" paddingTop="10px" paddingRight="30px">
                    {stores.map((store) => (
                        <CheckboxField value={store.StoreName} name={store.StoreName} label={store.StoreName} checked={checkStores[store]} onChange={handleStoreSelecteionChange}/>
                    ))} 
                </View>
              </Flex>
            );
          };
/*
        const handleStoreChange = (event) => {
            const name = event.target.name;
            const value = event.target.value;
            setInputs(values => ({...values, [name]: value}))
            setStatus("");
            setChanges([]);
            //inputs.supplier="";
            setSuppliers([]);
            fetchSuppliers(setSuppliers,event.target.value);
        }
 */
        const handleSupplierChange = (event) => {
            const name = event.target.name;
            const value = event.target.value;
            setInputs(values => ({...values, [name]: value}))
            setStatus("");
            setChanges([]);
        }
 
 
         return (

            <Flex   alignItems="center"    alignContent="flex-start" >

                <SelectField  key="supplier" name="supplier" placeholder="All suppliers" value={inputs.supplier || ""}  onChange={handleSupplierChange}>
                        {suppliers.map((supplier) => (
                            <option value={supplier}>
                                {supplier}
                            </option>
                        ))}

                </SelectField>
                <CheckboxSelectStores></CheckboxSelectStores>
{/*
                <Multiselect  key="storename" name="storename" placeholder="Select store" value={inputs.storename || ""}  onChange={handleStoreChange}>
                        {stores.map((store) => (
                            <option value={store.StoreName}>
                                {store.StoreName}
                            </option>
                        ))}

                </Multiselect>
                        */}
                <Button key="applydiffs" name="apply_changes" onClick={applyToStores} >
                    Apply changes
                </Button>
          
            </Flex>

        )
    }

    function DisplayContent() {

        if (changes.length !== 0) {
            return (
                <>
                    <Heading level={4}>Results</Heading>
                    <Table rowList={changes} rowkey='sku' />
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
        <div style={{ marginTop: '50px' }}>
            <h2>Select stores to apply changes</h2>
            <InputForm/>
            <Status status={status} />
            <DisplayContent  />
        </div>
    );
};



export default ApplyChanges;
