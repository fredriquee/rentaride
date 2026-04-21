import React from "react";
import axios from "axios";

// v2 - Updated API configuration with /api prefix routes
const API = axios.create({
  baseURL: "https://rentaride-gifa.onrender.com",
});

export default API;