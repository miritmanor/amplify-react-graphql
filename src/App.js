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
import FileUploader from "./pages/upload";
import CompareToStore from "./pages/compareToStore";
import ApplyChanges from "./pages/applyChanges";

const App = ({ signOut }) => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Products />} />
          <Route path="products" element={<Products />} />
          <Route path="storeproducts" element={<StoreProducts />} />
          <Route path="upload" element={<FileUploader />} />
          <Route path="compareToStore" element={<CompareToStore />} />
          <Route path="applyChanges" element={<ApplyChanges />} />
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
