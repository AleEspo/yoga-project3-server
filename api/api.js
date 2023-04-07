import axios from "axios";

const apiUrl =
  process.env.NODE_ENV === "production"
    ? `https://yogahome.cyclic.app`
    : `http://localhost:${Number(process.env.PORT)}`;

const axiosInstanceUrl = axios.create({
  baseURL: apiUrl,
});


// const apiURLs = {
//   development: `http://localhost:3000`,
//   production: `https://yogahome.cyclic.app`,
// };

// const axiosInstanceUrl = axios.create({ baseURL: apiURLs[process.env.NODE_ENV] });

export { axiosInstanceUrl };
