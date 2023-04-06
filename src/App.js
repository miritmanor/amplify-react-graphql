import React, { useState, useEffect } from "react";
import "./App.css";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  Button,
  Flex,
  Heading,
  Text,
  TextField,
  View,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import Layout from "./pages/Layout";
import NoPage from "./pages/NoPage";
import Products from "./pages/Products";
import FileUploader from "./pages/upload";
import Changes from "./pages/changes";

const App = ({ signOut }) => {
   return(
   <BrowserRouter>
   <Routes>
     <Route path="/" element={<Layout />}>
       <Route index element={<Products />} />
       <Route path="products" element={<Products />} />
       <Route path="*" element={<NoPage />} />
       <Route path="upload" element={<FileUploader />} />
       <Route path="changes" element={<Changes />} />
      </Route>
   </Routes>
   <div   style={{ marginTop: '50px' }}>
   <Button onClick={signOut}>Sign Out</Button>
   </div>
 </BrowserRouter>
   )
  
};



export default withAuthenticator(App);
