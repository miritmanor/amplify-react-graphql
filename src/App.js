//import React, { useState, useEffect } from "react";
import "./App.css";
//import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  Button, 
  withAuthenticator,
} from "@aws-amplify/ui-react";
import Layout from "./pages/Layout";
import NoPage from "./pages/NoPage";
import Products from "./pages/Products";
import StoreProducts from "./pages/StoreProducts";
import ApplyChanges from "./pages/applyChanges";
import Suppliers from "./pages/suppliers";
import Stores from "./pages/stores";

const App = ({ signOut }) => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Products />} />
          <Route path="products" element={<Products />} />
          <Route path="storeproducts" element={<StoreProducts />} />
          <Route path="applyChanges" element={<ApplyChanges />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="stores" element={<Stores />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
      <div style={{ marginTop: '50px' }}>
        <Button size="small" onClick={signOut}>Sign Out</Button>
      </div>
    </BrowserRouter>
  )

};



export default withAuthenticator(App);
