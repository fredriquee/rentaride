import axios from "axios";

const API = axios.create({
  baseURL: "https://your-backend.onrender.com",
});

export default API;