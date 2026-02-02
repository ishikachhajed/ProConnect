import axios from "axios";


export const BASE_URL = "https://proconnect-93x8.onrender.com/";

export const clientServer = axios.create({
  baseURL: BASE_URL, 
});
