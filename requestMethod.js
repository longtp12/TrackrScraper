import axios from "axios"

const BASE_URL = "http://localhost:6000/scraper/";

export const request = axios.create({
  baseURL: BASE_URL,
});

