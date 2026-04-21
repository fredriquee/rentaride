import React from "react";
import axios from "axios";

const API = axios.create({
  baseURL: "https://rentaride-gifa.onrender.com",
});

export default API;