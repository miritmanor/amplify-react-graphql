import React, { useState, useEffect } from "react";
//import "../App.css";
//import "@aws-amplify/ui-react/styles.css";
import {fetchStores,invokeLambdaDirectly,checkServerResponse} from "../lambdaAccess.js";
import {Table} from "../mapToTable.js";
import {OrderedDictionaryArrayTable} from "../OrderedDictionaryArrayTable.js";
import {
  Button,
  SelectField,
  Flex,
  //Heading,
  //Text,
  //TextField,
  View,
  //withAuthenticator,
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
                    Import from store to main database 
                </Button>            
            </Flex>
        )
    }

    function DisplayContent() {

        console.log("in DisplayContent");
        if (results.length !== 0) {
            console.log("there are results");
            return (
                <>
                <h2>Results for products import from store</h2>
                <Table rowList={results} rowkey='sku' />
                </>
            )
        }
        else if (products.length !== 0) {
            console.log("there are products");
            const columns=["ProductSKU","name","supplier","status","unit","regular_price","sale_price","description","short_description","id_in_store","category_id_in_store","supplier_id_in_store"];
            return (
                <>
                <h2>List of products currently in store</h2>
                {/*<Table rowList={products} rowkey='ProductSKU' />*/}
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
            <Status status={status} />
            <DisplayContent  />
        </View>
    );

};



export default StoreProducts;
