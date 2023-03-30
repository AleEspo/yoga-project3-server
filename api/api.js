import axios from 'axios';

const apiUrl = process.env.NODE_ENV === 'production' 
  ? `https://yogahome.cyclic.app`
  : `http://localhost:${Number(process.env.PORT)}`;

const axiosInstanceUrl = axios.create({
  baseURL: apiUrl,
});

export {axiosInstanceUrl};