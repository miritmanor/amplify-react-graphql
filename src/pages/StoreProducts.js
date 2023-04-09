import React, { useState, useEffect } from "react";
import "../App.css";
import "@aws-amplify/ui-react/styles.css";
import {getBaseURL,fetchProducts} from "../lambdaAccess.js";

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


const StoreProducts = () => {
  
  const [products,setProducts] = useState([])
  var supplier="ממלכת האגוזים";

  const BASEURL=getBaseURL();

  useEffect(() => {
    fetchProducts(setProducts);
  }, []);



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

    function FilterableStoreProductTable({ products }) {
      return (
        <div>
          <SearchBar />
        </div>
      );
    }

    

  return (
    <View className="App">
      <Heading level={1}>Store Products</Heading>

    </View>
  );
};



export default StoreProducts;
