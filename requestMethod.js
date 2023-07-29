import axios from "axios"

// const BASE_URL = "http://localhost:8006/scraper/";
const BASE_URL = "https://trackr-scraper.onrender.com/scraper";


export const request = axios.create({
  baseURL: BASE_URL,
});

