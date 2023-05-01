import React, { useState, useEffect } from "react";
import { CSVLink } from "react-csv";
import "../App.css";
import "@aws-amplify/ui-react/styles.css";
import {fetchProducts} from "../lambdaAccess.js";
//import {MyTable,Table} from "../mapToTable.js";
import {OrderedDictionaryArrayTable} from "../OrderedDictionaryArrayTable.js";
import {fetchSuppliers} from "../lambdaAccess.js";

//import { API } from "aws-amplify";
import {
  Flex,
  Heading,
  View,
  Button,
  TextField,
  SelectField,
} from "@aws-amplify/ui-react";


const Products = () => {
  const [products,setProducts] = useState([]);
  const [filteredProducts,setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputs, setInputs] = useState({});
  const [suppliers,setSuppliers] = useState([]);

  // only on first render - fetch products. when done it will set the products array
  useEffect(() => {
    console.log("in useEffect - fetching");
    fetchProducts(setProducts);
    fetchSuppliers(setSuppliers,"");
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
        for (var key in item) {
          if (typeof item[key] === 'string') {
            if (item[key].toLowerCase().includes(searchTerm.toLowerCase())) {
              return true;
            }
          }
        }
        return false;
      });
      setFilteredProducts(p);
     }, 500);
    return () => clearTimeout(timeOutId);
  }, [searchTerm,products]);

  function InputForm() {

    console.log("in inputform");
    const handleChange = (event) => {
        console.log("in handleChange");
        console.log(event.target.name, event.target.value);
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}))
    }

    function addProduct() {

    }


    return (
        <Flex   alignItems="center"    alignContent="flex-start" >
          <TextField   name="SKU" placeholder="SKU"  label="SKU"  labelHidden  variation="quiet" required />
          <TextField   name="name" placeholder="name"  label="name"  labelHidden  variation="quiet" required />
          <TextField   name="price" placeholder="price"  label="price"  labelHidden  variation="quiet" required />
          <SelectField  key="supplier" name="supplier" placeholder="Select supplier" value={inputs.supplier || ""}  onChange={handleChange}>
                {suppliers.map((supplier) => (
                    <option value={supplier}>
                        {supplier}
                    </option>
                ))}
          </SelectField>
          <SelectField  key="status" name="status" placeholder="status" value={inputs.status || ""}  onChange={handleChange}>
                    <option value='draft'> draft </option>
                    <option value='published'> published </option>
          </SelectField>
          <Button   key="addproducts" name="add_product" onClick={addProduct} >
              Add product 
          </Button>

        
        </Flex>
    )
  }

/*
  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = {
      name: form.get("name"),
      description: form.get("description"),
    };
    await API.graphql({
      query: createNoteMutation,
      variables: { input: data },
    });
    //fetchNotes();
    fetchProducts();
    event.target.reset();
  }

  async function deleteNote({ id }) {
    //const newNotes = notes.filter((note) => note.id !== id);
    //setNotes(newNotes);
    await API.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  }

  */

  const columns=["ProductSKU","name","supplier","status","unit","regular_price","sale_price","description","short_description"];
  const csvcolumns=["ProductSKU","name","supplier","status","unit","regular_price","sale_price"];



  return (
    <View className="App">
      <Heading level={1}>Commiz main database</Heading>

      {/*<InputForm/>*/}
      {/*
      <View as="form" margin="3rem 0" onSubmit={createProduct}>
        <Flex direction="row" justifyContent="center">
          <TextField
            name="name"
            placeholder="Note Name"
            label="Note Name"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="description"
            placeholder="Note Description"
            label="Note Description"
            labelHidden
            variation="quiet"
            required
          />
          <Button type="submit" variation="primary">
            Create Note
          </Button>
        </Flex>
      </View>
     */}
      <Flex   alignItems="center"    alignContent="flex-start" paddingTop="10px" paddingBottom="20px">
        <input type="text" placeholder="Search products" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <CSVLink data={filteredProducts} headers={csvcolumns} filename={"main-database-products"+searchTerm+".csv"} enclosingCharacter={``} className="amplify-button amplify-field-group__control">  Download as CSV</CSVLink>
      </Flex>

      <OrderedDictionaryArrayTable items={filteredProducts} columns={columns}/>

    </View>
  );
};



export default Products;
