import axios from "axios";

// ✅ One place to change the API URL for the entire project
// In development: uses http://localhost:5000
// In production:  set REACT_APP_API_URL in your .env file

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000"
});

export default API;