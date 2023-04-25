import React, { useState, useEffect } from "react";
import "../App.css";
import "@aws-amplify/ui-react/styles.css";
import {fetchProducts} from "../lambdaAccess.js";
//import {MyTable,Table} from "../mapToTable.js";
import {OrderedDictionaryArrayTable} from "../OrderedDictionaryArrayTable.js";

//import { API } from "aws-amplify";
import {
  Flex,
  Heading,
  View,
} from "@aws-amplify/ui-react";


const Products = () => {
  //const [notes, setNotes] = useState([]);
  const [products,setProducts] = useState([]);
  const [filteredProducts,setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  //var supplier="";
  //supplier="";

  //const BASEURL=getBaseURL();




  // only on first render - fetch products. when done it will set the products array
  useEffect(() => {
    console.log("in useEffect - fetching");
    fetchProducts(setProducts);
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
        for (var key in item) {
          if (item[key].toLowerCase().includes(searchTerm.toLowerCase()))
            return true;
        }
        return false;
      });
      setFilteredProducts(p);
     }, 500);
    return () => clearTimeout(timeOutId);
  }, [searchTerm,products]);




/*
  async function fetchProducts() {
    //const apiData = await API.graphql({ query: listNotes });
    var commizurl = BASEURL + 'products';
    if (supplier != "") {
        commizurl += '?supplier='+supplier;
    }
    fetch(commizurl)
       .then(response => response.json())
       .then(data => {
           console.log(data);
           setProducts(data);
       })

  }
*/
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
  function SearchBar() {
    const [supplier, setSupplier] = useState("");

    return (
      <form>
        <input type="text" placeholder="Supplier..." value={supplier} onChange={(e) => {setSupplier(e.target.value);}}
        />
        <label>
          <input type="checkbox" />
          {' '}
          Show all products
        </label>
      </form>
    );
  }
  */

  const columns=["ProductSKU","name","supplier","status","unit","regular_price","sale_price","description","short_description"];



  return (
    <View className="App">
      <Heading level={1}>Commiz main database</Heading>
      <Flex   alignItems="center"    alignContent="flex-start" >
        <input type="text" placeholder="Search products" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </Flex>

      {/*
      <View as="form" margin="3rem 0" onSubmit={createNote}>
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

       {/*<ProductTable products={products} />*/}
      {/*<MyTable rowList={products} rowkey='sku' />*/}
      {/*<OrderedDictionaryArrayTable {...{products,columns }}/>*/}
      <OrderedDictionaryArrayTable products={filteredProducts} columns={columns}/>

    </View>
  );
};



export default Products;
