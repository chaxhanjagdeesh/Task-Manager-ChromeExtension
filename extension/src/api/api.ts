import axios from "axios";

const api = axios.create({
  baseURL: "https://workplaceapi.epayroll.co.in/api",
});

export default api;