import React, { useState, useEffect } from "react";
import { CSVLink } from "react-csv";
import "../App.css";
import "@aws-amplify/ui-react/styles.css";
import {
  fetchProducts,
  fetchProduct,
  modifyProduct,
} from "../utils/lambdaAccess.js";
//import { OrderedDictionaryArrayTable } from "../components/OrderedDictionaryArrayTable.jsx";
import { ProductsTableWithSelection } from "../components/ProductsTableWithSelection.jsx";
import FileUploader from "../components/FileUploader";
import { isInSearchTerm } from "../utils/search.js";

import { Flex, Heading, View, Button, TextField } from "@aws-amplify/ui-react";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const onSelectionChange = (selectedRows) => {
    //console.log("selectedRows:", selectedRows);
    setSelectedProducts(
      products.filter((product, index) => selectedRows.includes(index))
    );
  };

  // todo add refresh button
  // todo refresh products after every sync or update!
  // todo check what to do with removed products. Maybe remove selected.
  // maybe an option to display only products that are available in at least one store.
  // how about CSV with a 'remove' column
  const [searchTerm, setSearchTerm] = useState("");
  const [productSKU, setProductSKU] = useState("");
  const [inputs, setInputs] = useState({});
  const [DbValues, setDbValues] = useState({});
  const [results, setResults] = useState("");

  // only on first render - fetch products. when done it will set the products array
  useEffect(() => {
    fetchProducts(setProducts);
  }, []);

  // when products changes, initiate filteredProducts to the same array
  useEffect(() => {
    //console.log("in useEffect - products ready");
    setFilteredProducts(products);
  }, [products]);

  // when the user enters something in the search(filter) string - wait a bit then filter the products array and put the results in filteredProducts
  useEffect(() => {
    //console.log("in useEffect - search");
    const timeOutId = setTimeout(() => {
      const p = products.filter((item) => {
        //console.log(item);
        return isInSearchTerm(item, searchTerm);
      });
      setFilteredProducts(p);
    }, 500);
    return () => clearTimeout(timeOutId);
    //}, [searchTerm,products]);
    // eslint-disable-next-line
  }, [searchTerm]);

  const handleChange = (event) => {
    //console.log("handleChange");
    const name = event.target.name;
    const value = event.target.value;
    if (name === "sku" && value === "") {
      setProductSKU(value);
    }
    //console.log("onchange: ",name,value);
    setInputs((values) => ({ ...values, [name]: value }));
    //setUpdate(1);
    setResults("");
  };

  function refreshProducts() {
    fetchProducts(setProducts);
  }

  function getProduct() {
    const supportedFields = [
      "name",
      "status",
      "regular_price",
      "sale_price",
      "unit",
    ];

    if ("sku" in inputs && inputs.sku !== 0) {
      setProductSKU(inputs.sku);
      fetchProduct(inputs.sku).then((res) => {
        //console.log("res:",res);
        for (var item in res) {
          //console.log(item,res[item])
          const name = item;
          const value = res[item];
          if (supportedFields.includes(item)) {
            setInputs((values) => ({ ...values, [name]: value }));
            setDbValues((values) => ({ ...values, [name]: value }));
          }
        }
        //console.log(inputs);
      });
    }
  }

  function updateProduct() {
    //console.log("in updateProduct");
    var changes = {};
    for (var val in DbValues) {
      if (DbValues[val] !== inputs[val]) {
        //console.log("Difference: ",val,DbValues[val],inputs[val])
        if (val === "status") {
          if (inputs[val] !== "draft" && inputs[val] !== "publish") {
            console.log("Illegal value: ", inputs[val]);
            setResults("Illegal value for " + val + ": " + inputs[val]);
            return;
          }
        }
        changes[val] = inputs[val];
      }
    }
    if (Object.keys(changes).length !== 0) {
      console.log("There are changes");
      modifyProduct(inputs.sku, changes).then((res) => {
        //console.log("res:",res);
        setResults(res);
        getProduct();

        // update this product new values in products list

        const newList = products.map((product) => {
          if (product["ProductSKU"] === inputs.sku) {
            const updated = product;
            updated["name"] = inputs.name;
            updated["unit"] = inputs.unit;
            updated["status"] = inputs.status;
            updated["regular_price"] = inputs.regular_price;
            updated["sale_price"] = inputs.sale_price;
            return updated;
          }
          return product;
        });
        setProducts(newList);
      });
      //setUpdate(1);
    } else {
      //console.log("No changes");
      //setUpdate(0);
      setResults("No changes to apply");
    }
  }
  function Results() {
    return results;
  }

  /*
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
  */

  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateButtonText, setUpdateButtonText] = useState("Update product");
  function showUpdateButton() {
    //console.log("in showUpdateButton");
    if (showUpdateForm) {
      setShowUpdateForm(false);
      setUpdateButtonText("Update product");
    } else {
      setShowUpdateForm(true);
      setUpdateButtonText("Hide update form");
    }
  }

  const [showImportForm, setShowImportForm] = useState(false);
  const [importButtonText, setImportButtonText] = useState(
    "Import changes from CSV/Excel"
  );
  function showImportButton() {
    if (showImportForm) {
      setShowImportForm(false);
      setImportButtonText("Import changes from CSV/Excel");
    } else {
      setShowImportForm(true);
      setImportButtonText("Hide import form");
    }
  }
  const columns = [
    "ProductSKU",
    "name",
    "supplier",
    "status",
    "unit",
    "regular_price",
    "sale_price",
    "description",
    "short_description",
  ];
  const csvcolumns = [
    "ProductSKU",
    "name",
    "supplier",
    "status",
    "unit",
    "regular_price",
    "sale_price",
  ];

  return (
    <View style={{ marginTop: "30px" }}>
      <h2>Commiz main database</h2>

      <Flex
        alignItems="center"
        alignContent="flex-start"
        paddingTop="10px"
        paddingBottom="20px"
      >
        <input
          type="text"
          placeholder="Search products"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <CSVLink
          data={filteredProducts}
          headers={csvcolumns}
          filename={"main-database-products" + searchTerm + ".csv"}
          enclosingCharacter={``}
          className="amplify-button amplify-field-group__control"
        >
          {" "}
          Download as CSV
        </CSVLink>
        <CSVLink
          data={selectedProducts}
          headers={csvcolumns}
          filename={"selected-main-database-products.csv"}
          enclosingCharacter={``}
          className="amplify-button amplify-field-group__control"
        >
          {" "}
          Download selected as CSV
        </CSVLink>
        <Button
          key="showUpdateButton"
          name="show_update_button"
          onClick={showUpdateButton}
        >
          {updateButtonText}
        </Button>
        <Button
          key="showImportButton"
          name="show_import_button"
          onClick={showImportButton}
        >
          {importButtonText}
        </Button>
        <Button
          key="refreshProducts"
          name="refresh_products"
          onClick={refreshProducts}
        >
          Refresh list
        </Button>
      </Flex>
      {showUpdateForm && (
        <Flex
          alignItems="top"
          alignContent="flex-start"
          paddingTop="5px"
          paddingBottom="20px"
          direction="column"
        >
          <Flex alignItems="center" alignContent="flex-start">
            Update product:
            <TextField
              name="sku"
              placeholder="SKU"
              label="SKU"
              labelHidden
              variation="quiet"
              value={inputs.sku || ""}
              onChange={handleChange}
              required
            />
            <Button key="getproduct" name="get_product" onClick={getProduct}>
              Fetch product details
            </Button>
          </Flex>
          {productSKU && (
            <Flex alignItems="center" alignContent="flex-start">
              Details:
              <TextField
                name="name"
                placeholder="name"
                label="name"
                labelHidden
                variation="quiet"
                value={inputs.name || ""}
                onChange={handleChange}
              />
              <TextField
                name="status"
                placeholder="status"
                label="status"
                labelHidden
                variation="quiet"
                value={inputs.status || ""}
                onChange={handleChange}
              />
              <TextField
                name="unit"
                placeholder="unit"
                label="unit"
                labelHidden
                variation="quiet"
                value={inputs.unit || ""}
                onChange={handleChange}
              />
              <TextField
                name="regular_price"
                placeholder="price"
                label="price"
                labelHidden
                variation="quiet"
                value={inputs.regular_price || ""}
                onChange={handleChange}
              />
              <TextField
                name="sale_price"
                placeholder="sale price"
                label="sale price"
                labelHidden
                variation="quiet"
                value={inputs.sale_price || ""}
                onChange={handleChange}
              />
              <Button
                key="updateproduct"
                name="update_product"
                onClick={updateProduct}
              >
                Update{" "}
              </Button>
              <Results />
            </Flex>
          )}
        </Flex>
      )}
      {showImportForm && <FileUploader refresh={refreshProducts} />}

      <Heading level={5} paddingBottom="10px">
        Product list
      </Heading>

      <ProductsTableWithSelection
        items={filteredProducts}
        columns={columns}
        onSelectionChange={onSelectionChange}
      />
    </View>
  );
};

export default Products;
