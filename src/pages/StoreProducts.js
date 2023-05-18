import React, { useState, useEffect } from "react";

import {fetchStores,invokeLambdaDirectly,checkServerResponse} from "../lambdaAccess.js";
import {OrderedDictionaryArrayTable} from "../OrderedDictionaryArrayTable.js";
import { CSVLink } from "react-csv";
import {
  Button,
  SelectField,
  Flex,
  View,
} from "@aws-amplify/ui-react";
import {Status} from "../status.js";



const StoreProducts = () => {
  
    const [products,setProducts] = useState([]);
    const [results,setResults] = useState([]);
    const [inputs, setInputs] = useState({});
    const [status,setStatus] = useState("");
    const [stores,setStores] = useState([]);

    //var outputType='Products';

    useEffect(() => {
        //Runs only on the first render
        console.log("fetching stores");
        fetchStores(setStores);
     }, []);


    function InputForm() {

        console.log("in inputform");
        const handleChange = (event) => {
            console.log("in handleChange");
            console.log(event.target.name, event.target.value);
            const name = event.target.name;
            const value = event.target.value;
            setInputs(values => ({...values, [name]: value}))
            setProducts([]);
            setResults([]);
        }
 
        const showProducts = () => {
            console.log("in showProducts");
            console.log("inputs:",inputs);
            if (!Object.hasOwn(inputs, 'storename') || !inputs.storename) {
                console.log("missing store name");
                setStatus("Store name missing");
                setProducts([]);
            } else {
                setProducts([]);
                setResults([]);
                setStatus("Waiting for results");
                invokeLambdaDirectly('GET','/products/{storename+}','/products/'+inputs.storename,{'storename':inputs.storename},{},"").then(res => {
                    console.log(res);
                    const message=checkServerResponse(res);
                    if (message !== "") {
                        console.log("Error: ",message);
                        setStatus(message);
                    }
                    else {
                        const payload= JSON.parse(res.Payload);
                        const body=JSON.parse(payload.body);
                        setProducts(body);
                        setStatus("ready");
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
            } else {
                setProducts([]);
                setResults([]);
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
                        setStatus("ready");
                    }
                } );
            }
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
                <Button   key="showproducts" name="show_products" onClick={showProducts} >
                    Show products 
                </Button>
                <Button   key="importproducts" name="import_products" onClick={importProducts} >
                    Sync new products and suppliers from store to main DB
                </Button>            
            </Flex>
        )
    }

    function DisplayContent() {

        console.log("in DisplayContent");
        if (results.length !== 0) {
            console.log("there are results");
            const columns=["sku","result"];

            return (
                <>
                <h2>Results for products import from store</h2>
                <Flex   alignItems="center"    alignContent="flex-start" paddingTop="10px" paddingBottom="10px">
                    <CSVLink data={results} headers={columns} filename={inputs.storename+"-import-results.csv"} className="amplify-button amplify-field-group__control">  Download results as CSV</CSVLink>
                </Flex>
                {/*<Table rowList={results} rowkey='sku' /> */}
                <OrderedDictionaryArrayTable items={results} columns={columns}/>
                </>
            )
        }
        else if (products.length !== 0) {
            console.log("there are products");
            const columns=["ProductSKU","name","supplier","status","unit","regular_price","sale_price","id_in_store","category_id_in_store","supplier_id_in_store"];
            return (
                <>
                <h2>List of products currently in store</h2>
                <Flex   alignItems="center"    alignContent="flex-start" paddingTop="10px" paddingBottom="10px">
                    <CSVLink data={products} headers={columns} filename={inputs.storename+"-products.csv"} enclosingCharacter={``}  className="amplify-button amplify-field-group__control">  Download as CSV</CSVLink>
                </Flex>
                <OrderedDictionaryArrayTable items={products} columns={columns}/>
                </>
            )
        } else {
             console.log("nothing to show");
             return ( <>  </> );
        }
    }

    return (
        <View style={{ marginTop: '50px' }}>
            <h2>Select store to display products</h2>
            <InputForm/>
            <h4>  <Status status={status} /> </h4>
            <DisplayContent  />
        </View>
    );

};



export default StoreProducts;
