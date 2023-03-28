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

const App = ({ signOut }) => {
   return(
   <BrowserRouter>
   <Routes>
     <Route path="/" element={<Layout />}>
       <Route index element={<Products />} />
       <Route path="*" element={<NoPage />} />
     </Route>
   </Routes>
   <Button onClick={signOut}>Sign Out</Button>
 </BrowserRouter>
   )
  
};



export default withAuthenticator(App);
