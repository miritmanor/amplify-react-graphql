import React, { useState, useEffect } from "react";

import {fetchStores,fetchSuppliers,syncStoreToMainDB,invokeLambdaDirectly,checkServerResponse} from "../utils/lambdaAccess.js";
import {OrderedDictionaryArrayTable} from "../components/OrderedDictionaryArrayTable.js";
import { CSVLink } from "react-csv";
import {
  Button,
  SelectField,
  Flex,
  View,
  Heading,
} from "@aws-amplify/ui-react";
import {Status} from "../utils/status.js";
import {isInSearchTerm} from "../utils/search.js"


const StoreProducts = () => {
  
    const [products,setProducts] = useState([]);
    const [showProducts,setShowProducts] = useState(null);
    const [filteredProducts,setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [results,setResults] = useState([]);

    const [showResults,setShowResults] = useState(null);
    const [showSyncFromStoreREsults,setShowSyncFromStoreResults] = useState(null);
    const [changes,setChanges] = useState([]);
    const [showChanges,setShowChanges] = useState(null);
    const [inputs, setInputs] = useState({});
    const [status,setStatus] = useState("");
    const [stores,setStores] = useState([]);
    const [suppliers,setSuppliers] = useState([]);

    //var outputType='Products';

    useEffect(() => {
        //Runs only on the first render
        console.log("fetching stores");
        fetchStores(setStores);
        fetchSuppliers(setSuppliers,""); // fetch all suppliers, not filtered by store, as there is no store selection yet
     }, []);

       // when products changes, initiate filteredProducts to the same array
    useEffect(() => {
        console.log("in useEffect - products ready");
        setFilteredProducts(products);
    }, [products]);

    // when the user enters something in the search(filter) string - wait a bit then filter the products array and put the results in filteredProducts
    useEffect(() => {
        console.log("in useEffect - search");
        const timeOutId = setTimeout(() => {
            const p = products.filter((item) => {
                //console.log(item);
                return (isInSearchTerm(item,searchTerm));

            });
            setFilteredProducts(p);
        }, 500);
        return () => clearTimeout(timeOutId);
    }, [searchTerm,products]);

    const showStoreDifferences = () => {
        console.log("in showStoreDifferences");
        //setInputs(values => ({...values,  showStoreDifferences: true }));
        console.log("inputs:",inputs);
        setStatus("Working... waiting for results");
        setProducts([]);
        setShowProducts(false);
        setResults([]);
        setShowResults(false);
        setShowSyncFromStoreResults(false);
        setChanges([]);
        setShowChanges(false);
        if (!Object.hasOwn(inputs, 'storename') || !inputs.storename) {
            console.log("missing store name");
            setStatus("Store name missing");
            //setChanges([]);
        } else { 
            const storename=inputs.storename;
            const queryStringParameters={
                supplier: inputs.supplier
            }
            console.log(queryStringParameters);
            invokeLambdaDirectly('GET','/changes/{storename+}','/changes/'+storename,{'storename':storename},queryStringParameters,"").then(res => {
                try{
                    console.log(res);
                    const payload= JSON.parse(res.Payload);
                    const body=JSON.parse(payload.body);
                    const message=checkServerResponse(res);
                    if (message !== "") {
                        console.log("Error: ",message);
                        setStatus(message);
                    }
                    else {
                        if (body.length === 0) {//empty
                            setStatus("Completed comparing store and central database, no differences found");
                        } else {
                            setStatus("Completed comparing store and central database");
                            setShowChanges(true);
                        }
                    
                        //type="differences";
                        setChanges(body);
                        
                    }                   
                }
                catch (err) {
                    console.log(err);
                    setStatus("Failed to get changes");
                }
            });

        }
    }

    function InputForm() {

        console.log("in inputform");
        const handleStoreChange = (event) => {
            console.log("in handleStoreChange");
            console.log(event.target.name, event.target.value);
            const name = event.target.name;
            const value = event.target.value;
            setInputs(values => ({...values, [name]: value}))
            setProducts([]);
            setShowProducts(false)
            setResults([]);
            setShowResults(false);
            setChanges([]);
            setShowChanges(false);
            setSuppliers([]);
            fetchSuppliers(setSuppliers,event.target.value);
            setInputs(values => ({...values, supplier: ""}));
            //console.log(inputs.supplier);
        }

        const handleSupplierChange = (event) => {
            const name = event.target.name;
            const value = event.target.value;
            setInputs(values => ({...values, [name]: value}))
            setStatus("");
            setChanges([]);
        }
 
        const showProducts = () => {
            console.log("in showProducts");
            console.log("inputs:",inputs);
            if (!Object.hasOwn(inputs, 'storename') || !inputs.storename) {
                console.log("missing store name");
                setStatus("Store name missing");
                setProducts([]);
                setShowProducts(false);
                setChanges([]);
                setShowChanges(false);
            } else {
                setProducts([]);
                setShowProducts(false);
                setResults([]);
                setShowResults(false);
                setShowSyncFromStoreResults(false);
                setChanges([]);
                setShowChanges(false);
                setStatus("Waiting for results");
                const queryStringParameters={
                    supplier: inputs.supplier
                }
                console.log(queryStringParameters);
                invokeLambdaDirectly('GET','/products/{storename+}','/products/'+inputs.storename,{'storename':inputs.storename},queryStringParameters,"").then(res => {
                    console.log(res);
                    const message=checkServerResponse(res);
                    if (message !== "") {
                        console.log("Error: ",message);
                        setStatus(message);
                    }
                    else {
                        const payload= JSON.parse(res.Payload);
                        const body=JSON.parse(payload.body);
                        if (body.length === 0) {//empty
                            setStatus("No products found");
                        } else {
                            setProducts(body);
                            setShowProducts(true);
                            setStatus("ready");
                        }
                    }
                }
                );
            }
        }

        const importProducts = () => {
            console.log("in importProducts");
            console.log("inputs:",inputs);
            if (!Object.hasOwn(inputs, 'storename') || !inputs.storename) {
                console.log("missing store name");
                setStatus("Store name missing");
                setProducts([]);
                setShowProducts(false);
                setChanges([]);
                setShowChanges(false);
            } else {
                setProducts([]);
                setShowProducts(false);
                setResults([]);
                setShowResults(false);
                setShowSyncFromStoreResults(false);
                setChanges([]);
                setShowChanges(false);
                setStatus("Waiting for results");
                invokeLambdaDirectly('POST','/products/import','/products/import',{},{'store':inputs.storename},"").then(res => {
                    console.log(res);
                    const message=checkServerResponse(res);
                    console.log("message:",message);
                    if (message !== "") {
                        console.log("Error: ",message);
                        setStatus(message);
                    }
                    else {
                        const payload= JSON.parse(res.Payload);
                        const body=JSON.parse(payload.body);
                        setResults(body);
                        setShowResults(true);
                        setStatus("ready");
                    }
                } );
            }
        }

        const syncStoreToDB = () => {
            console.log("in syncStoreToDB");
            console.log("inputs:",inputs);
            if (!Object.hasOwn(inputs, 'storename') || !inputs.storename) {
                console.log("missing store name");
                setStatus("Store name missing");
                setProducts([]);
                setShowProducts(false);
                setChanges([]);
                setShowChanges(false);
            } else {
                setProducts([]);
                setShowProducts(false);
                setResults([]);
                setShowResults(false);
                setShowSyncFromStoreResults(false);
                setChanges([]);
                setShowChanges(false);
                setStatus("Waiting for results");
                syncStoreToMainDB(inputs.storename,inputs.supplier).then(res => {
                    console.log(res);
                    if (res.length === 0) {
                        setStatus("No changes applied");
                    } else{
                        setResults(res);
                        setShowSyncFromStoreResults(true);
                        setStatus("ready");
                    }
                } );
            }
            
        }

        return (
            <Flex   alignItems="center"    alignContent="flex-start"  >
                <SelectField  key="storename" name="storename"  placeholder="Select store" value={inputs.storename || ""}  onChange={handleStoreChange}>
                        {stores && stores.map((store) => (
                            <option value={store.StoreName} key={store.StoreName}>
                                {store.StoreName}
                            </option>
                        ))}

                </SelectField>
                <SelectField  key="supplier" name="supplier" placeholder="All suppliers" value={inputs.supplier || ""}  onChange={handleSupplierChange}>
                        {suppliers && suppliers.map((supplier) => (
                            <option value={supplier}  key={supplier}>
                                {supplier}
                            </option>
                        ))}

                </SelectField>
                <Button   key="showproducts" name="show_products" onClick={showProducts} >
                    Show products 
                </Button>
                <Button key="showdiffs" name="show_differences" onClick={showStoreDifferences} >
                    Show differences 
                </Button>  
                <Button   key="importproducts" name="import_products" onClick={importProducts} >
                    Sync new/removed products to DB
                </Button>     
                <Button   key="syncStoreToDB" name="syncStoreToDB" onClick={syncStoreToDB} >
                    Sync to main DB
                </Button>       
            </Flex>
        )
    }

    function DisplayContent() {
        const productColumns=["ProductSKU","name","supplier","status","unit","regular_price","sale_price","id_in_store","category_id_in_store","supplier_id_in_store"];
        const resultColumns=["sku","result"];
        const changeColumns=["SKU","Name","Supplier","Details"];
        const SyncResultsColumns=["SKU","Name","Supplier","Result","Details"];

        return(
            <>
                {showResults && 
                (<> 
                <Heading level={5} >Results for new/removed products sync to DB</Heading>
                <Flex   alignItems="center"    alignContent="flex-start" paddingTop="10px" paddingBottom="10px">
                    <CSVLink data={results} headers={resultColumns} filename={inputs.storename+"-import-results.csv"} className="amplify-button amplify-field-group__control">  Download results as CSV</CSVLink>
                </Flex>
                <OrderedDictionaryArrayTable items={results} columns={resultColumns}/>
                </>)}
                {showSyncFromStoreREsults && 
                (<> 
                <Heading level={5} >Results of syncing updates from store</Heading>
                <Flex   alignItems="center"    alignContent="flex-start" paddingTop="10px" paddingBottom="10px">
                    <CSVLink data={results} headers={SyncResultsColumns} filename={inputs.storename+"-import-results.csv"} className="amplify-button amplify-field-group__control">  Download results as CSV</CSVLink>
                </Flex>
                <OrderedDictionaryArrayTable items={results} columns={SyncResultsColumns}/>
                </>)}
                {showProducts &&
                ( <>
                    <Heading level={5} >Products in store</Heading>
                    <Flex   alignItems="center"    alignContent="flex-start" paddingTop="10px" paddingBottom="10px">
                        <input type="text" placeholder="Search products" autoFocus value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <CSVLink data={filteredProducts} headers={productColumns} filename={inputs.storename+"-products.csv"} enclosingCharacter={``}  className="amplify-button amplify-field-group__control">  Download as CSV</CSVLink>
                    </Flex>
                    <OrderedDictionaryArrayTable items={filteredProducts} columns={productColumns}/>
                    </> )
                }
                {showChanges &&
                (
                    <>
                    <Heading level={5} >Differences between store and main database</Heading>
                    <Flex   alignItems="center"    alignContent="flex-start" paddingTop="10px" paddingBottom="10px">
                        <CSVLink data={changes} headers={changeColumns} filename={inputs.storename+"-changes.csv"} className="amplify-button amplify-field-group__control">  Download as CSV</CSVLink>
                    </Flex>
                    <OrderedDictionaryArrayTable items={changes} columns={changeColumns}/>
                </>
                )
                }
            </>
        )

    }

    return (
        <View style={{ marginTop: '30px' }}>
            <h2>View and compare store products</h2>
            <InputForm/>
            <h4>  <Status status={status} /> </h4>
            <DisplayContent  />
        </View>
    );

};



export default StoreProducts;
