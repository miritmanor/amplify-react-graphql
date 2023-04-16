import React, { useState, useEffect } from "react";
import "../App.css";
import "@aws-amplify/ui-react/styles.css";
import {getBaseURL,fetchProducts} from "../lambdaAccess.js";
import {MyTable,Table} from "../mapToTable.js";
import {OrderedDictionaryArrayTable} from "../OrderedDictionaryArrayTable.js";

import { API } from "aws-amplify";
import {
  Button,
  Flex,
  Heading,
  Text,
  TextField,
  View,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "../graphql/mutations";


const Products = () => {
  //const [notes, setNotes] = useState([]);
  const [products,setProducts] = useState([])
  var supplier="";
  //supplier="";

  const BASEURL=getBaseURL();

  useEffect(() => {
    fetchProducts(setProducts);
  }, []);
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

    function FilterableProductTable({ products }) {
      return (
        <div>
          <SearchBar />
          <ProductTable products={products} />
        </div>
      );
    }

    function ProductRow({ product }) {
      const name = product.stocked ? product.name :
        <span style={{ color: 'red' }}>
          {product.name}
        </span>;

        const columns=[];


        Object.keys(product).forEach((key, index) => {
          //console.log(key,product[key])
          columns.push(
            <td> {product[key]} </td>
          ) ;
        });
      console.log({product})

      return (
      <>
        <tr>
        {columns}
        </tr>
        </>
      );
    }

  function ProductTable({ products }) {

      const rows = [];
      var productstable="";


      var header=0; 
      products.forEach((product) => {
        if (header == 0) {
          var headercolumns=[];
          Object.keys(product).forEach((key, index) => {
            //console.log(key,product[key])
            headercolumns.push(
              <th> {key} </th>
            ) ;
          });
          rows.push(
           <tr>
           {headercolumns}
           </tr>
          );
          header=1;
        }
        rows.push(
          <ProductRow
            product={product}
            key={product.sku} />
        );
      });

    return (
    <>
      <Heading level={2}>Products</Heading>
     {/*<SearchBar /> */}
     <table>
       <tbody>
        {rows}
        </tbody>
        </table>
      </>
      );
   }

  const columns=["ProductSKU","name","supplier","status","unit","regular_price","sale_price","description","short_description"];

  return (
    <View className="App">
      <Heading level={1}>Commiz main database</Heading>
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
      <OrderedDictionaryArrayTable {...{products,columns }}/>

    </View>
  );
};



export default Products;
