import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
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
import { listNotes } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";


const App = ({ signOut }) => {
  //const [notes, setNotes] = useState([]);
  const [products,setProducts] = useState([])
  var supplier="ממלכת האגוזים";
  //supplier="";
  const BASEURL="https://p2qa0zr9n5.execute-api.us-east-1.amazonaws.com/dev/"

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    //const apiData = await API.graphql({ query: listNotes });
    URL = BASEURL + 'products';
    if (supplier != "") {
        URL += '?supplier='+supplier;
    }
    fetch(URL)
       .then(response => response.json())
       .then(data => {
           console.log(data);
           setProducts(data);
       })
    //const response = await fetch('https://p2qa0zr9n5.execute-api.us-east-1.amazonaws.com/dev/products');
    //const notesFromAPI = apiData.data.listNotes.items;
    //setNotes(notesFromAPI);
  }

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
      const line = <tr> nothing </tr>
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

      <ProductTable products={products} />
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};



export default withAuthenticator(App);
