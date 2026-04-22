import React from "react";
import axios from "axios";

// v2 - Updated API configuration with /api prefix routes
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
});

export default API;